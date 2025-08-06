import { NextResponse } from "next/server";
import jwksClient from "jwks-rsa";
import jwt, { Jwt } from "jsonwebtoken";
import { prisma } from "@/lib/db";

// The Kinde issuer URL should already be in your `.env` file
// from when you initially set up Kinde. This will fetch your
// public JSON web keys file
const client = jwksClient({
  jwksUri: `${process.env.KINDE_ISSUER_URL}/.well-known/jwks.json`,
});

interface KindeWebhookEvent {
  type: string;
  data: {
    user: {
      id: string;
      email: string;
      first_name?: string;
      last_name?: string;
    };
  };
}

export async function POST(req: Request) {
  try {
    // Get the token from the request
    const token = await req.text();

    // Decode the token
    const { header } = jwt.decode(token, { complete: true }) as Jwt;
    const { kid } = header;

    // Verify the token
    const key = await client.getSigningKey(kid);
    const signingKey = key.getPublicKey();
    const event = jwt.verify(token, signingKey) as KindeWebhookEvent;

    // Handle various events
    switch (event?.type) {
      case "user.updated":
        await handleUserUpdated(event.data.user);
        console.log("User updated:", event.data);
        break;

      case "user.created":
        await handleUserCreated(event.data.user);
        console.log("User created:", event.data);
        break;

      case "user.deleted":
        await handleUserDeleted(event.data.user);
        console.log("User deleted:", event.data);
        break;

      default:
        console.log(`Unhandled event type: ${event?.type}`);
        break;
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error("Webhook error:", err.message);
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
  }

  return NextResponse.json({ status: 200, statusText: "success" });
}

async function handleUserCreated(user: KindeWebhookEvent["data"]["user"]) {
  try {
    await prisma.user.create({
      data: {
        id: user.id,
        email: user.email!,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
      },
    });
    console.log(`User synced to database: ${user.email}`);
  } catch (error) {
    // Handle duplicate user (user might already exist)
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      console.log(`User already exists in database: ${user.email}`);
    } else {
      console.error("Error creating user in database:", error);
      throw error;
    }
  }
}

async function handleUserUpdated(user: KindeWebhookEvent["data"]["user"]) {
  try {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        firstName: user.first_name || "",
        lastName: user.last_name || "",
      },
    });
    console.log(`User updated in database: ${user.email}`);
  } catch (error) {
    console.error("Error updating user in database:", error);
    throw error;
  }
}

async function handleUserDeleted(user: KindeWebhookEvent["data"]["user"]) {
  try {
    await prisma.user.delete({
      where: { id: user.id },
    });
    console.log(`User deleted from database: ${user.email}`);
  } catch (error) {
    // User might not exist in our database
    console.log(`User not found for deletion: ${user.email}`);
  }
}
