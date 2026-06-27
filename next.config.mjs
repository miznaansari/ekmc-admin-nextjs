import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: '/onboarding',
        destination: '/onBoarding',
      },
      {
        source: '/onboarding/:path*',
        destination: '/onBoarding/:path*',
      },
      {
        source: '/verifyqr',
        destination: '/verifyQR',
      },
      {
        source: '/accountsetting',
        destination: '/AccountSetting',
      },
    ];
  },
  env: {
    VITE_REACT_APP_BACKEND_URL: process.env.VITE_REACT_APP_BACKEND_URL,
    VITE_REACT_APP_IMAGE_DELIVERY_URL: process.env.VITE_REACT_APP_IMAGE_DELIVERY_URL,
    VITE_OLAMAP_API_KEY: process.env.VITE_OLAMAP_API_KEY,
    VITE_OLAMAP_PROJECT_ID: process.env.VITE_OLAMAP_PROJECT_ID,
    VITE_IMAGE_TO_FORMATED_DATA_CONVERTER_URL: process.env.VITE_IMAGE_TO_FORMATED_DATA_CONVERTER_URL,
    VITE_GEMINI_KEY: process.env.VITE_GEMINI_KEY,
    VITE_APP_COMMENT: process.env.VITE_APP_COMMENT,
    VITE_GOOGLE_PLACES_API_KEY: process.env.VITE_GOOGLE_PLACES_API_KEY,
    VITE_OLAMAP_PROJECT_KEY: process.env.VITE_OLAMAP_PROJECT_KEY,
  },
  turbopack: {
    rules: {
      '*.ttf': {
        type: 'asset',
      },
      '*.woff': {
        type: 'asset',
      },
      '*.woff2': {
        type: 'asset',
      },
      '*.otf': {
        type: 'asset',
      },
      '*.eot': {
        type: 'asset',
      },
    },
  },
};

export default nextConfig;
