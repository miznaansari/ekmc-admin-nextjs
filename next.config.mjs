import path from 'path';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  turbopack: {},
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
  webpack: (config, { webpack }) => {
    config.plugins.push(
      new webpack.DefinePlugin({
        'import.meta.env': JSON.stringify({
          VITE_REACT_APP_BACKEND_URL: process.env.VITE_REACT_APP_BACKEND_URL,
          VITE_REACT_APP_IMAGE_DELIVERY_URL: process.env.VITE_REACT_APP_IMAGE_DELIVERY_URL,
          VITE_OLAMAP_API_KEY: process.env.VITE_OLAMAP_API_KEY,
          VITE_OLAMAP_PROJECT_ID: process.env.VITE_OLAMAP_PROJECT_ID,
          VITE_IMAGE_TO_FORMATED_DATA_CONVERTER_URL: process.env.VITE_IMAGE_TO_FORMATED_DATA_CONVERTER_URL,
          VITE_GEMINI_KEY: process.env.VITE_GEMINI_KEY,
          VITE_APP_COMMENT: process.env.VITE_APP_COMMENT,
          VITE_GOOGLE_PLACES_API_KEY: process.env.VITE_GOOGLE_PLACES_API_KEY,
          VITE_OLAMAP_PROJECT_KEY: process.env.VITE_OLAMAP_PROJECT_KEY,
        }),
      })
    );

    // Alias react-router-dom and react-router to our compatibility layer
    config.resolve.alias['react-router-dom'] = path.resolve(process.cwd(), './app/(admin)/ui/react-router-dom-compat.js');
    config.resolve.alias['react-router'] = path.resolve(process.cwd(), './app/(admin)/ui/react-router-dom-compat.js');

    // Add font loader support for fluentui icons
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/i,
      type: 'asset/resource',
    });

    return config;
  },
};

export default nextConfig;
