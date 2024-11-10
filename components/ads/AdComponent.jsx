"use client";

import Script from "next/script";

const AdComponent = () => {
  return (
    <>
      {/* Google AdSense Script */}
      <Script
        async
        src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1591708379540743"
        crossOrigin="anonymous"
      ></Script>

      {/* Ad Container */}
      <ins
        className="adsbygoogle"
        style={{ display: "block" }}
        data-ad-client="ca-pub-1591708379540743"
        data-ad-slot="2047409029"
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>

      {/* Initialize the Ad */}
      <Script id="Adsense-Init" strategy="afterInteractive">
        {`
          (adsbygoogle = window.adsbygoogle || []).push({});
        `}
      </Script>
    </>
  );
};

export default AdComponent;
