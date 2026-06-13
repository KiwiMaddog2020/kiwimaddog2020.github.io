<?xml version="1.0" encoding="utf-8"?>
<!-- Renders the Atom feed as a styled, on-brand page when opened in a
     browser (so the nav "Feed" link is human-readable, not raw XML), while
     the file stays a valid Atom feed for readers. Same ink + copper system
     as the rest of the site via the shared stylesheet. -->
<xsl:stylesheet version="1.0"
  xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="utf-8" indent="yes"/>
  <xsl:template match="/atom:feed">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title>Feed · Kevin Madson · Research notes</title>
        <link rel="stylesheet" href="/assets/research-notes.css"/>
      </head>
      <body class="hub">
        <div class="page">
          <nav class="top">
            <a class="wordmark" href="/">Kevin Madson</a>
            <span class="crumb">Feed</span>
            <div class="links"><a href="/">Notes</a></div>
          </nav>
          <main id="main">
            <h1>Subscribe</h1>
            <p>You are looking at the Atom feed for the
              <a href="/">research notes</a>. Paste this page's address into any
              feed reader to subscribe, and new notes arrive as they are
              published. Everything currently in the feed:</p>
            <div class="notes-list">
              <ul role="list">
                <xsl:for-each select="atom:entry">
                  <li>
                    <a class="note-title">
                      <xsl:attribute name="href"><xsl:value-of select="atom:link/@href"/></xsl:attribute>
                      <xsl:value-of select="atom:title"/>
                    </a>
                  </li>
                </xsl:for-each>
              </ul>
            </div>
          </main>
          <footer>
            Written and verified with the tooling it describes.
            <a href="/">All research notes.</a>
          </footer>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
