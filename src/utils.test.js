

import { parseEphemeridesHtml } from "./utils/utils";

const sampleHtml = `
<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 4.01 Transitional//EN">

<html>
<head>
<title>NEO Confirmation Page: Query Results</title>
<META HTTP-EQUIV="Content-Type" CONTENT="text/html; charset=ISO-8859-1">
</head>
<body>
<center>Quick links :
 <a href="http://www.minorplanetcenter.net/iau/mpc.html"> Home Page </a> :
 <a href="http://www.minorplanetcenter.net/iau/ContactUs.html"> Contact Us </a> :
 <a href="http://www.minorplanetcenter.net/iau/TheIndex.html"> Index </a> :
 <a href="http://www.minorplanetcenter.net/iau/MPCSiteMap.html"> Site Map </a> :
 <a href="http://www.minorplanetcenter.net/iau/SearchSite.html"> Search Site </a>
</center><p><hr><p>
<h1>NEO Confirmation Page: Query Results</h1>
Below are the results of your request from the Minor Planet Center's
NEO Confirmation Page.
<p>
<p>Use the feedback form to report
<a href="https://www.minorplanetcenter.net/cgi-bin/feedback.cgi?U=cgi-bin/confirmeph&amp;S=New%20Problems&amp;D=M">problems</a> or
<a href="https://www.minorplanetcenter.net/cgi-bin/feedback.cgi?U=cgi-bin/confirmeph&amp;S=Comments&amp;D=M">to comment on this page</a>.
<p>
   Ephemerides are for
 the geocenter.
 <p><hr><p>
 <p><b>P22dnTN</b>
<p>Get the <a href="http://cgi.minorplanetcenter.net/cgi-bin/showobsorbs.cgi?Obj=P22dnTN&obs=y">observations</a> or <a href="http://cgi.minorplanetcenter.net/cgi-bin/showobsorbs.cgi?Obj=P22dnTN&orb=y">orbits</a>.
 <pre>
Date       UT      R.A. (J2000) Decl.  Elong.  V        Motion      Uncertainty
            h                                        "/min   P.A.
2025 08 23 14     00 43 03.2 +23 21 37 128.9  20.4    0.65  002.7   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.083333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.083333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 15     00 43 03.3 +23 22 16 128.9  20.4    0.65  002.6   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.125000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.125000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 16     00 43 03.5 +23 22 55 129.0  20.4    0.65  002.5   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.166667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.166667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 17     00 43 03.6 +23 23 34 129.0  20.4    0.65  002.4   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.208333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.208333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 18     00 43 03.7 +23 24 13 129.0  20.4    0.65  002.3   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.250000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.250000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 19     00 43 03.8 +23 24 53 129.0  20.4    0.65  002.3   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.291667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.291667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 20     00 43 03.9 +23 25 32 129.1  20.4    0.65  002.2   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.333333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.333333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 21     00 43 04.0 +23 26 11 129.1  20.4    0.65  002.1   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.375000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.375000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 22     00 43 04.1 +23 26 50 129.1  20.4    0.65  002.0   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.416667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.416667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 23     00 43 04.2 +23 27 29 129.2  20.4    0.65  002.0   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.458333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.458333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 00     00 43 04.3 +23 28 08 129.2  20.4    0.65  001.9   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.500000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.500000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 01     00 43 04.4 +23 28 47 129.2  20.4    0.65  001.8   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.541667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.541667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 02     00 43 04.5 +23 29 26 129.3  20.4    0.65  001.7   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.583333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.583333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 03     00 43 04.6 +23 30 05 129.3  20.4    0.65  001.6   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.625000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.625000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 04     00 43 04.7 +23 30 44 129.3  20.4    0.65  001.6   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.666667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.666667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 05     00 43 04.7 +23 31 23 129.3  20.4    0.65  001.5   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.708333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.708333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 06     00 43 04.8 +23 32 02 129.4  20.3    0.65  001.4   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.750000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.750000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 07     00 43 04.9 +23 32 41 129.4  20.3    0.65  001.3   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.791667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.791667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 08     00 43 04.9 +23 33 20 129.4  20.3    0.65  001.3   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.833333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.833333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 09     00 43 05.0 +23 34 00 129.5  20.3    0.65  001.2   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.875000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.875000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 10     00 43 05.1 +23 34 39 129.5  20.3    0.65  001.1   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.916667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.916667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 11     00 43 05.1 +23 35 18 129.5  20.3    0.65  001.0   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.958333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460911.958333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 12     00 43 05.2 +23 35 57 129.6  20.3    0.65  000.9   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460912.000000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460912.000000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 13     00 43 05.2 +23 36 36 129.6  20.3    0.65  000.9   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460912.041667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460912.041667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 14     00 43 05.2 +23 37 15 129.6  20.3    0.65  000.8   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460912.083333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnTN&JD=2460912.083333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
 </pre>
 <p><hr><p>
 <p><b>P22dnNA</b>
<p>Get the <a href="http://cgi.minorplanetcenter.net/cgi-bin/showobsorbs.cgi?Obj=P22dnNA&obs=y">observations</a> or <a href="http://cgi.minorplanetcenter.net/cgi-bin/showobsorbs.cgi?Obj=P22dnNA&orb=y">orbits</a>.
 <pre>
Date       UT   *  R.A. (J2000) Decl.  Elong.  V        Motion      Uncertainty
            h                                        "/min   P.A.
2025 08 23 14     22 41 32.2 +01 51 58 164.6  22.6    1.35  111.5   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.083333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.083333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 15     22 41 37.3 +01 51 28 164.6  22.6    1.35  111.6   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.125000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.125000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 16     22 41 42.3 +01 50 59 164.7  22.6    1.35  111.6   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.166667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.166667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 17     22 41 47.3 +01 50 29 164.7  22.6    1.35  111.6   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.208333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.208333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 18     22 41 52.4 +01 49 59 164.7  22.6    1.35  111.7   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.250000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.250000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 19     22 41 57.4 +01 49 29 164.7  22.6    1.35  111.7   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.291667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.291667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 20     22 42 02.4 +01 48 59 164.8  22.6    1.35  111.8   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.333333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.333333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 21     22 42 07.4 +01 48 29 164.8  22.6    1.35  111.8   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.375000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.375000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 22     22 42 12.5 +01 47 58 164.8  22.6    1.35  111.8   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.416667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.416667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 23 23     22 42 17.5 +01 47 28 164.8  22.6    1.35  111.9   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.458333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.458333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 00     22 42 22.5 +01 46 58 164.9  22.6    1.35  111.9   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.500000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.500000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 01     22 42 27.5 +01 46 28 164.9  22.6    1.35  112.0   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.541667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.541667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 02     22 42 32.5 +01 45 57 164.9  22.6    1.35  112.0   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.583333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.583333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 03     22 42 37.5 +01 45 27 165.0  22.6    1.35  112.1   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.625000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.625000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 04     22 42 42.5 +01 44 57 165.0  22.6    1.35  112.1   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.666667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.666667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 05     22 42 47.5 +01 44 26 165.0  22.6    1.35  112.1   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.708333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.708333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 06     22 42 52.5 +01 43 56 165.0  22.6    1.35  112.2   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.750000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.750000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 07     22 42 57.5 +01 43 25 165.1  22.6    1.35  112.2   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.791667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.791667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 08     22 43 02.5 +01 42 55 165.1  22.6    1.35  112.3   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.833333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.833333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 09     22 43 07.5 +01 42 24 165.1  22.6    1.35  112.3   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.875000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.875000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 10     22 43 12.5 +01 41 53 165.2  22.6    1.35  112.3   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.916667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.916667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 11     22 43 17.4 +01 41 23 165.2  22.6    1.35  112.4   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.958333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.958333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 12     22 43 22.4 +01 40 52 165.2  22.6    1.35  112.4   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460912.000000&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460912.000000&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 13     22 43 27.4 +01 40 21 165.2  22.6    1.35  112.5   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460912.041667&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460912.041667&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
2025 08 24 14     22 43 32.4 +01 39 50 165.3  22.6    1.35  112.5   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460912.083333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460912.083333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
 </pre>
<p><hr><p>
These calculations have been performed on the
<a href="https://www.minorplanetcenter.net/iau/Ack/TamkinFoundation.html">Tamkin
Foundation Computing Network</a>.
<p><hr><p>
<p>
      <a href="http://validator.w3.org/check?uri=referer"><img border="0"
          src="http://www.w3.org/Icons/valid-html401"
          alt="Valid HTML 4.01!" height="31" width="88"></a>
</p>
</body>
</html>
`;

test("parseEphemeridesHtml extracts objects and rows", () => {
  const result = parseEphemeridesHtml(sampleHtml);
  const keys = Object.keys(result)
  expect(keys.length).toBe(2);
  expect(keys[0]).toBe("P22dnTN");
  expect(keys[1]).toBe("P22dnNA");
  expect(result["P22dnTN"].ephem.length).toBe(25);
  // 2025 08 23 14     22 41 32.2 +01 51 58 164.6  22.6    1.35  111.5   <a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.083333&Ext=VAR&OC=000&META=apm00">Map</a>/<a href="http://cgi.minorplanetcenter.net/cgi-bin/uncertaintymap.cgi?Obj=P22dnNA&JD=2460911.083333&Form=Y&Ext=VAR&OC=000&META=apm00">Offsets</a>
  const eph = result["P22dnNA"].ephem[0];
  expect(eph.dec).toBe("+01 51 58");
  expect(eph.motion).toBe(1.35);
});
