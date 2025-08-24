import Image from "next/image";

import { buttonVariants } from "@/components/ui/button";
import HeroImage from "@/public/hero.png";
import { LoginLink } from "@kinde-oss/kinde-auth-nextjs/components";

export function Hero({ id }: { id: string }) {
  return (
    <>
      <section className="relative flex items-center justify-center" id={id}>
        <div className="relative items-center w-full py-12 lg:py-20">
          <div className="text-center">
            <span className="text-sm text-primary font-medium tracking-tight bg-primary/10 px-4 py-2 rounded-full">
              Effortless Invoicing. Get Paid Faster.
            </span>

            <h1 className="mt-8 text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-medium leading-none">
              Smart Invoicing
              <span className="block text-primary">Simplified.</span>
            </h1>

            <p className="max-w-xl mx-auto mt-4 text-base font-light lg:text-lg text-muted-foreground tracking-tighter">
              Invixio simplifies invoicing so you can focus on growing your
              business. Create and send invoices with just a few clicks.
            </p>
            <div className="flex items-center gap-x-5 w-full justify-center mt-5">
              <LoginLink className={buttonVariants()}>
                Start Free Trial
              </LoginLink>
            </div>
          </div>

          <div className="relative items-center w-full py-12 mx-auto mt-12">
            <svg
              className="absolute -mt-24 blur-3xl"
              fill="none"
              viewBox="0 0 400 400"
              height="100%"
              width="100%"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g clipPath="url(#clip0_10_20)">
                <g filter="url(#filter0_f_10_20)">
                  <path
                    d="M128.6 0H0V322.2L106.2 134.75L128.6 0Z"
                    fill="#C084FC" // violet-400
                  />
                  <path
                    d="M0 322.2V400H240H320L106.2 134.75L0 322.2Z"
                    fill="#A855F7" // violet-500
                  />
                  <path
                    d="M320 400H400V78.75L106.2 134.75L320 400Z"
                    fill="#9333EA" // violet-600
                  />
                  <path
                    d="M400 0H128.6L106.2 134.75L400 78.75V0Z"
                    fill="#7E22CE" // violet-700
                  />
                </g>
              </g>
              <defs>
                <filter
                  colorInterpolationFilters="sRGB"
                  filterUnits="userSpaceOnUse"
                  height="720.666"
                  id="filter0_f_10_20"
                  width="720.666"
                  x="-160.333"
                  y="-160.333"
                >
                  <feFlood floodOpacity="0" result="BackgroundImageFix" />
                  <feBlend
                    in="SourceGraphic"
                    in2="BackgroundImageFix"
                    mode="normal"
                    result="shape"
                  />
                  <feGaussianBlur
                    result="effect1_foregroundBlur_10_20"
                    stdDeviation="80.1666"
                  />
                </filter>
              </defs>
            </svg>

            <Image
              src={HeroImage}
              alt="Invixio invoicing dashboard screenshot"
              priority
              className="relative object-cover w-full border rounded-lg shadow-2xl lg:rounded-2xl"
            />
          </div>
        </div>
      </section>
    </>
  );
}
