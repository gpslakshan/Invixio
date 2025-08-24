import Link from "next/link";
import React from "react";
import { FaFacebook, FaTwitter, FaLinkedin, FaInstagram } from "react-icons/fa";

const LandingPageFooter = () => {
  return (
    <footer className="bg-violet-500 text-white mt-16 rounded-t-2xl">
      <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4">
            <Link href="#home">Invixio</Link>
          </h2>
          <p className="text-sm opacity-80">
            Streamline your billing with our all-in-one platform. Create, send,
            track, and manage invoices with ease, so you can focus on what
            matters most—growing your business.
          </p>
        </div>

        {/* Navigation Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Product</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="#features" className="hover:underline">
                Features
              </Link>
            </li>
            <li>
              <Link href="#pricing" className="hover:underline">
                Pricing
              </Link>
            </li>
            <li>
              <Link href="#faqs" className="hover:underline">
                FAQs
              </Link>
            </li>
          </ul>
        </div>

        {/* Company Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Company</h3>
          <ul className="space-y-2 text-sm">
            <li>
              <Link href="#about" className="hover:underline">
                About
              </Link>
            </li>
            <li>
              <Link href="#contact" className="hover:underline">
                Contact
              </Link>
            </li>
            <li>
              <Link href="#privacy" className="hover:underline">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>

        {/* Social Links */}
        <div>
          <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
          <div className="flex space-x-4">
            <Link href="#" aria-label="Facebook">
              <FaFacebook size={20} />
            </Link>
            <Link href="#" aria-label="Twitter">
              <FaTwitter size={20} />
            </Link>
            <Link href="#" aria-label="LinkedIn">
              <FaLinkedin size={20} />
            </Link>
            <Link href="#" aria-label="Github">
              <FaInstagram size={20} />
            </Link>
          </div>
        </div>
      </div>
      {/* Bottom Bar */}
      <div className="border-t border-white/20 py-4 text-center text-sm opacity-80">
        © {new Date().getFullYear()} Invixio. All rights reserved.
      </div>
    </footer>
  );
};

export default LandingPageFooter;
