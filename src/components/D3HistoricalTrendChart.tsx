import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { Thermometer, Droplets, Calendar, TrendingUp, RefreshCw, BarChart2, Eye, EyeOff, ShieldAlert } from 'lucide-react';

export interface HistoricalDataPoint {
  date: string; // YYYY-MM-DD
  temp: number; // °C
  tempMax?: number;
  tempMin?: number;
  humidity: number; // %
  rainfall?: number; // mm
  windSpeed?: number; // km/h
}

export interface ParsedDataPoint extends HistoricalDataPoint {
  dateObj: Date;
}

interface D3HistoricalTrendChartProps {
  lat: number;
  lng: number;
  cityName: string;
  currentLang?: string;
}

const LOCALIZED_CHART_TEXT: Record<string, Record<string, string>> = {
  en: {
    title: "30-Day Historical Temperature & Humidity Trend",
    subtitle: "D3.js Dual-Axis Time Series Analytics & Climatic Correlation Engine",
    tempLabel: "Temperature (°C)",
    humidityLabel: "Humidity (%)",
    avgTemp: "30D Avg Temp",
    peakTemp: "Peak Temp",
    minTemp: "Min Temp",
    avgHumidity: "30D Avg Humidity",
    maxHumidity: "Peak Humidity",
    volatility: "Climatic Volatility",
    correlation: "Thermal-Moisture Correlation",
    loading: "Computing 30-Day D3 Historical Telemetry...",
    showTemp: "Show Temperature",
    showHumidity: "Show Humidity",
    showArea: "Fill Gradient Area",
    hoverTip: "Hover or tap on chart nodes to inspect daily metrics",
  },
  te: {
    title: "30 రోజుల చారిత్రక ఉష్ణోగ్రత & తేమ ట్రెండ్",
    subtitle: "D3.js ద్వంద్వ-అక్షాల కాల శ్రేణి విశ్లేషణ & వాతావరణ కనెక్షన్ ఇంజిన్",
    tempLabel: "ఉష్ణోగ్రత (°C)",
    humidityLabel: "తేమ (%)",
    avgTemp: "30 రోజుల సగటు ఉష్ణోగ్రత",
    peakTemp: "గరిష్ట ఉష్ణోగ్రత",
    minTemp: "కనిష్ట ఉష్ణోగ్రత",
    avgHumidity: "30 రోజుల సగటు తేమ",
    maxHumidity: "గరిష్ట తేమ",
    volatility: "వాతావరణ మార్పుల రేటు",
    correlation: "ఉష్ణోగ్రత-తేమ సంబంధం",
    loading: "30 రోజుల D3 చారిత్రక డేటాను లోడ్ చేస్తోంది...",
    showTemp: "ఉష్ణోగ్రత చూపించు",
    showHumidity: "తేమ చూపించు",
    showArea: "గ్రేడియంట్ ఏరియా నింపు",
    hoverTip: "రోజువారీ కొలతలను పరిశీలించడానికి చార్ట్ పై క్లిక్ చేయండి",
  },
  hi: {
    title: "30-दिवसीय ऐतिहासिक तापमान और आर्द्रता प्रवृत्ति",
    subtitle: "D3.js दोहरी-अक्ष समय श्रृंखला विश्लेषण और जलवायु सहसंबंध इंजन",
    tempLabel: "तापमान (°C)",
    humidityLabel: "आर्द्रता (%)",
    avgTemp: "30-दिवसीय औसत तापमान",
    peakTemp: "उच्चतम तापमान",
    minTemp: "न्यूनतम तापमान",
    avgHumidity: "30-दिवसीय औसत आर्द्रता",
    maxHumidity: "उच्चतम आर्द्रता",
    volatility: "जलवायु परिवर्तनशीलता",
    correlation: "तापमान-आर्द्रता सहसंबंध",
    loading: "30-दिवसीय D3 ऐतिहासिक टेलीमेट्री लोड हो रही है...",
    showTemp: "तापमान दिखाएं",
    showHumidity: "आर्द्रता दिखाएं",
    showArea: "क्षेत्र भरें",
    hoverTip: "दैनिक मीट्रिक देखने के लिए चार्ट पर कर्सर ले जाएं",
  },
  ta: {
    title: "30 நாள் வரலாற்று வெப்பநிலை மற்றும் ஈரப்பதப் போக்கு",
    subtitle: "D3.js இரட்டை அச்சு நேரத் தொடர் பகுப்பாய்వు எஞ்சின்",
    tempLabel: "வெப்பநிலை (°C)",
    humidityLabel: "ஈரப்பதம் (%)",
    avgTemp: "30 நாள் சராசரி வெப்பநிலை",
    peakTemp: "உச்ச வெப்பநிலை",
    minTemp: "குறைந்தபட்ச வெப்பநிலை",
    avgHumidity: "30 நாள் சராசரி ஈரப்பதம்",
    maxHumidity: "உச்ச ஈரப்பதம்",
    volatility: "காலநிலை மாற்றம்",
    correlation: "வெப்பநிலை-ஈரப்பத தொடர்பு",
    loading: "30 நாள் D3 தரவை ஏற்றுகிறது...",
    showTemp: "வெப்பநிலையைக் காட்டு",
    showHumidity: "ஈரப்பதத்தைக் காட்டு",
    showArea: "வண்ண பகுதி",
    hoverTip: "விவரங்களைப் பார்க்க வரைபடத்தில் கிளிக் செய்க",
  }
};

export default function D3HistoricalTrendChart({ lat, lng, cityName, currentLang = 'en' }: D3HistoricalTrendChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const langKey = LOCALIZED_CHART_TEXT[currentLang] ? currentLang : 'en';
  const text = LOCALIZED_CHART_TEXT[langKey];

  const [data, setData] = useState<HistoricalDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toggle Controls
  const [showTemp, setShowTemp] = useState(true);
  const [showHumidity, setShowHumidity] = useState(true);
  const [showArea, setShowArea] = useState(true);

  // Active Tooltip item state for mobile touch / keyboard fallback
  const [hoveredPoint, setHoveredPoint] = useState<HistoricalDataPoint | null>(null);

  // Fetch 30-day historical data
  useEffect(() => {
    let isMounted = true;
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/historical-weather?lat=${lat}&lng=${lng}`);
        if (!res.ok) {
          throw new Error('Failed to fetch historical weather telemetry');
        }
        const json = await res.json();
        if (isMounted) {
          if (json.history && Array.isArray(json.history)) {
            setData(json.history);
          } else {
            throw new Error('Invalid historical payload structure');
          }
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || 'Error loading historical data');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHistory();
    return () => {
      isMounted = false;
    };
  }, [lat, lng]);

  // Main D3 Rendering Effect
  useEffect(() => {
    if (loading || error || data.length === 0 || !svgRef.current || !containerRef.current) {
      return;
    }

    const svgElement = svgRef.current;
    const container = containerRef.current;

    // Clear previous D3 drawings
    d3.select(svgElement).selectAll('*').remove();

    // Container width and aspect ratio
    const width = container.clientWidth || 700;
    const height = 360;

    const margin = { top: 30, right: 60, bottom: 45, left: 55 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const svg = d3
      .select(svgElement)
      .attr('width', width)
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .style('overflow', 'visible');

    // Parse Dates
    const parseDate = d3.timeParse('%Y-%m-%d');
    const parsedData: ParsedDataPoint[] = data.map((d) => ({
      ...d,
      dateObj: parseDate(d.date) || new Date(d.date),
    }));

    // Scales
    const xExtent = d3.extent(parsedData, (d: ParsedDataPoint) => d.dateObj) as [Date, Date];
    const xScale = d3.scaleTime().domain(xExtent).range([0, innerWidth]);

    // Temp Scale (Left Y-Axis)
    const minTemp = (d3.min(parsedData, (d: ParsedDataPoint) => d.tempMin ?? d.temp) ?? 15) - 3;
    const maxTemp = (d3.max(parsedData, (d: ParsedDataPoint) => d.tempMax ?? d.temp) ?? 40) + 3;
    const tempScale = d3.scaleLinear().domain([minTemp, maxTemp]).nice().range([innerHeight, 0]);

    // Humidity Scale (Right Y-Axis)
    const minHumidity = Math.max(0, (d3.min(parsedData, (d: ParsedDataPoint) => d.humidity) ?? 30) - 10);
    const maxHumidity = Math.min(100, (d3.max(parsedData, (d: ParsedDataPoint) => d.humidity) ?? 90) + 10);
    const humidityScale = d3.scaleLinear().domain([minHumidity, maxHumidity]).range([innerHeight, 0]);

    // Chart Group G
    const g = svg
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    // Add SVG Gradients for Area Fills
    const defs = svg.append('defs');

    // Temp Gradient (Amber/Orange)
    const tempGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-temp-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    tempGrad.append('stop').attr('offset', '0%').attr('stop-color', '#f97316').attr('stop-opacity', 0.35);
    tempGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f97316').attr('stop-opacity', 0.0);

    // Humidity Gradient (Cyan/Teal)
    const humGrad = defs
      .append('linearGradient')
      .attr('id', 'd3-hum-gradient')
      .attr('x1', '0%')
      .attr('y1', '0%')
      .attr('x2', '0%')
      .attr('y2', '100%');
    humGrad.append('stop').attr('offset', '0%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.3);
    humGrad.append('stop').attr('offset', '100%').attr('stop-color', '#06b6d4').attr('stop-opacity', 0.0);

    // Gridlines (Horizontal)
    const yGrid = d3
      .axisLeft(tempScale)
      .tickSize(-innerWidth)
      .tickFormat(() => '')
      .ticks(6);

    g.append('g')
      .attr('class', 'grid')
      .style('stroke-dasharray', '3 3')
      .style('stroke', '#1e293b')
      .style('stroke-opacity', 0.7)
      .call(yGrid);

    // Area Generators
    if (showArea) {
      if (showHumidity) {
        const humArea = d3
          .area<ParsedDataPoint>()
          .curve(d3.curveMonotoneX)
          .x((d) => xScale(d.dateObj))
          .y0(innerHeight)
          .y1((d) => humidityScale(d.humidity));

        g.append('path')
          .datum(parsedData)
          .attr('fill', 'url(#d3-hum-gradient)')
          .attr('d', humArea);
      }

      if (showTemp) {
        const tempArea = d3
          .area<ParsedDataPoint>()
          .curve(d3.curveMonotoneX)
          .x((d) => xScale(d.dateObj))
          .y0(innerHeight)
          .y1((d) => tempScale(d.temp));

        g.append('path')
          .datum(parsedData)
          .attr('fill', 'url(#d3-temp-gradient)')
          .attr('d', tempArea);
      }
    }

    // Line Generators
    const tempLine = d3
      .line<ParsedDataPoint>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.dateObj))
      .y((d) => tempScale(d.temp));

    const humLine = d3
      .line<ParsedDataPoint>()
      .curve(d3.curveMonotoneX)
      .x((d) => xScale(d.dateObj))
      .y((d) => humidityScale(d.humidity));

    // Render Humidity Path (Cyan)
    if (showHumidity) {
      const humPath = g
        .append('path')
        .datum(parsedData)
        .attr('fill', 'none')
        .attr('stroke', '#06b6d4')
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '5 2')
        .attr('d', humLine);

      // Animate line path
      const totalLength = humPath.node()?.getTotalLength() || 0;
      humPath
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // Render Temperature Path (Orange/Amber)
    if (showTemp) {
      const tempPath = g
        .append('path')
        .datum(parsedData)
        .attr('fill', 'none')
        .attr('stroke', '#f97316')
        .attr('stroke-width', 3)
        .style('filter', 'drop-shadow(0px 2px 8px rgba(249, 115, 22, 0.4))')
        .attr('d', tempLine);

      const totalLength = tempPath.node()?.getTotalLength() || 0;
      tempPath
        .attr('stroke-dasharray', `${totalLength} ${totalLength}`)
        .attr('stroke-dashoffset', totalLength)
        .transition()
        .duration(1000)
        .ease(d3.easeCubicOut)
        .attr('stroke-dashoffset', 0);
    }

    // Draw Data Circles
    parsedData.forEach((d) => {
      const x = xScale(d.dateObj);

      if (showHumidity) {
        g.append('circle')
          .attr('cx', x)
          .attr('cy', humidityScale(d.humidity))
          .attr('r', 3)
          .attr('fill', '#0f172a')
          .attr('stroke', '#06b6d4')
          .attr('stroke-width', 1.5);
      }

      if (showTemp) {
        g.append('circle')
          .attr('cx', x)
          .attr('cy', tempScale(d.temp))
          .attr('r', 3.5)
          .attr('fill', '#f97316')
          .attr('stroke', '#fff')
          .attr('stroke-width', 1);
      }
    });

    // X-Axis (Dates)
    const xAxis = d3
      .axisBottom(xScale)
      .ticks(innerWidth < 500 ? 5 : 10)
      .tickFormat((d) => d3.timeFormat('%b %d')(d as Date));

    const xAxisG = g
      .append('g')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    xAxisG.selectAll('text').style('fill', '#94a3b8').style('font-size', '10px').style('font-family', 'monospace');
    xAxisG.selectAll('line').style('stroke', '#334155');
    xAxisG.select('.domain').style('stroke', '#334155');

    // Left Y-Axis (Temperature °C)
    if (showTemp) {
      const yAxisTemp = d3
        .axisLeft(tempScale)
        .ticks(6)
        .tickFormat((d) => `${d}°C`);

      const yAxisTempG = g.append('g').call(yAxisTemp);
      yAxisTempG.selectAll('text').style('fill', '#f97316').style('font-weight', 'bold').style('font-size', '10px').style('font-family', 'monospace');
      yAxisTempG.selectAll('line').style('stroke', '#f97316').style('stroke-opacity', 0.4);
      yAxisTempG.select('.domain').style('stroke', '#f97316').style('stroke-opacity', 0.5);

      // Y-Axis Label
      g.append('text')
        .attr('transform', 'rotate(-90)')
        .attr('y', -42)
        .attr('x', -innerHeight / 2)
        .attr('text-anchor', 'middle')
        .style('fill', '#f97316')
        .style('font-size', '10px')
        .style('font-family', 'monospace')
        .style('font-weight', 'bold')
        .text('Temperature (°C)');
    }

    // Right Y-Axis (Humidity %)
    if (showHumidity) {
      const yAxisHum = d3
        .axisRight(humidityScale)
        .ticks(6)
        .tickFormat((d) => `${d}%`);

      const yAxisHumG = g
        .append('g')
        .attr('transform', `translate(${innerWidth}, 0)`)
        .call(yAxisHum);

      yAxisHumG.selectAll('text').style('fill', '#06b6d4').style('font-weight', 'bold').style('font-size', '10px').style('font-family', 'monospace');
      yAxisHumG.selectAll('line').style('stroke', '#06b6d4').style('stroke-opacity', 0.4);
      yAxisHumG.select('.domain').style('stroke', '#06b6d4').style('stroke-opacity', 0.5);

      // Y-Axis Label
      g.append('text')
        .attr('transform', 'rotate(90)')
        .attr('y', -innerWidth - 45)
        .attr('x', innerHeight / 2)
        .attr('text-anchor', 'middle')
        .style('fill', '#06b6d4')
        .style('font-size', '10px')
        .style('font-family', 'monospace')
        .style('font-weight', 'bold')
        .text('Humidity (%)');
    }

    // Interactive Crosshair & Hover Overlay
    const focusLine = g
      .append('line')
      .attr('stroke', '#94a3b8')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '3 3')
      .attr('y1', 0)
      .attr('y2', innerHeight)
      .style('opacity', 0);

    const focusCircleTemp = g
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#f97316')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    const focusCircleHum = g
      .append('circle')
      .attr('r', 6)
      .attr('fill', '#06b6d4')
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('opacity', 0);

    // Bisector for finding closest data point
    const bisectDate = d3.bisector<ParsedDataPoint, Date>((d) => d.dateObj).left;

    // Overlay Rect for capturing mouse events
    svg
      .append('rect')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)
      .attr('width', innerWidth)
      .attr('height', innerHeight)
      .attr('fill', 'transparent')
      .style('cursor', 'crosshair')
      .on('mousemove touchmove', function (event) {
        const [mouseX] = d3.pointer(event);
        const x0 = xScale.invert(mouseX);
        const i = bisectDate(parsedData, x0, 1);
        const d0 = parsedData[i - 1];
        const d1 = parsedData[i];

        let d = d0;
        if (d1 && d0) {
          d = x0.getTime() - d0.dateObj.getTime() > d1.dateObj.getTime() - x0.getTime() ? d1 : d0;
        }

        if (d) {
          const xPos = xScale(d.dateObj);

          focusLine.attr('x1', xPos).attr('x2', xPos).style('opacity', 0.8);

          if (showTemp) {
            focusCircleTemp
              .attr('cx', xPos)
              .attr('cy', tempScale(d.temp))
              .style('opacity', 1);
          }

          if (showHumidity) {
            focusCircleHum
              .attr('cx', xPos)
              .attr('cy', humidityScale(d.humidity))
              .style('opacity', 1);
          }

          setHoveredPoint(d);
        }
      })
      .on('mouseleave touchend', function () {
        focusLine.style('opacity', 0);
        focusCircleTemp.style('opacity', 0);
        focusCircleHum.style('opacity', 0);
        setHoveredPoint(null);
      });

  }, [data, loading, error, showTemp, showHumidity, showArea]);

  // Compute 30-Day Aggregates
  const stats = React.useMemo(() => {
    if (data.length === 0) return null;
    const temps = data.map((d) => d.temp);
    const humidities = data.map((d) => d.humidity);

    const avgT = temps.reduce((a, b) => a + b, 0) / temps.length;
    const maxT = Math.max(...temps);
    const minT = Math.min(...temps);

    const avgH = humidities.reduce((a, b) => a + b, 0) / humidities.length;
    const maxH = Math.max(...humidities);
    const minH = Math.min(...humidities);

    // Compute Volatility (Std Dev of temperature)
    const stdDevT = Math.sqrt(
      temps.reduce((sq, n) => sq + Math.pow(n - avgT, 2), 0) / temps.length
    );

    // Correlation indicator: negative correlation between heat and moisture or high coastal humidity
    let correlationText = 'Stable Regional Profile';
    if (avgH > 70) {
      correlationText = 'High Moisture Buffer (Coastal Sector)';
    } else if (avgT > 32 && avgH < 40) {
      correlationText = 'Dry Thermal Combustion Risk';
    } else if (stdDevT > 3.5) {
      correlationText = 'High Frontal Fluctuation';
    }

    return {
      avgTemp: avgT.toFixed(1),
      maxTemp: maxT.toFixed(1),
      minTemp: minT.toFixed(1),
      avgHum: Math.round(avgH),
      maxHum: maxH,
      minHum: minH,
      volatility: stdDevT < 1.5 ? 'Low' : stdDevT < 3.0 ? 'Moderate' : 'High',
      correlationText,
    };
  }, [data]);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-xl space-y-6 relative overflow-hidden">
      {/* Background Ambient Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-orange-600/5 rounded-full filter blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-600/5 rounded-full filter blur-3xl -z-10 pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-orange-400 animate-pulse" />
            <span className="text-[10px] font-mono font-bold text-orange-400 bg-orange-950/60 border border-orange-900/60 px-2 py-0.5 rounded uppercase tracking-wider">
              D3.js Visualization Engine
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-900/60 px-2 py-0.5 rounded uppercase tracking-wider">
              30-Day Historical Telemetry
            </span>
          </div>
          <h3 className="text-base font-black font-mono text-slate-100 tracking-tight">
            {text.title} — <span className="text-cyan-400">{cityName}</span>
          </h3>
          <p className="text-xs text-slate-400 font-mono">{text.subtitle}</p>
        </div>

        {/* Display Toggles */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
          <button
            onClick={() => setShowTemp(!showTemp)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition flex items-center gap-1.5 cursor-pointer border ${
              showTemp
                ? 'bg-orange-950/80 border-orange-500 text-orange-400 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-500"></span>
            <span>{text.showTemp}</span>
          </button>

          <button
            onClick={() => setShowHumidity(!showHumidity)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition flex items-center gap-1.5 cursor-pointer border ${
              showHumidity
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-400 font-bold'
                : 'bg-slate-900 border-slate-800 text-slate-500 line-through'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
            <span>{text.showHumidity}</span>
          </button>

          <button
            onClick={() => setShowArea(!showArea)}
            className={`px-2.5 py-1 rounded text-xs font-mono transition flex items-center gap-1.5 cursor-pointer border ${
              showArea
                ? 'bg-slate-800 border-slate-700 text-slate-200'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            {showArea ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
            <span>{text.showArea}</span>
          </button>
        </div>
      </div>

      {/* Aggregate Statistics Ribbon */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[10px] font-mono text-orange-400 uppercase font-semibold flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-orange-400" />
              <span>{text.avgTemp}</span>
            </span>
            <div className="text-xl font-black font-mono text-slate-100 mt-1">{stats.avgTemp}°C</div>
            <span className="text-[9px] font-mono text-slate-400">Range: {stats.minTemp}°C - {stats.maxTemp}°C</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[10px] font-mono text-orange-400 uppercase font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-orange-500" />
              <span>{text.peakTemp}</span>
            </span>
            <div className="text-xl font-black font-mono text-orange-400 mt-1">{stats.maxTemp}°C</div>
            <span className="text-[9px] font-mono text-slate-400">30-Day Thermal Maximum</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-400" />
              <span>{text.avgHumidity}</span>
            </span>
            <div className="text-xl font-black font-mono text-slate-100 mt-1">{stats.avgHum}%</div>
            <span className="text-[9px] font-mono text-slate-400">Range: {stats.minHum}% - {stats.maxHum}%</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[10px] font-mono text-cyan-400 uppercase font-semibold flex items-center gap-1">
              <Droplets className="w-3 h-3 text-cyan-500" />
              <span>{text.maxHumidity}</span>
            </span>
            <div className="text-xl font-black font-mono text-cyan-400 mt-1">{stats.maxHum}%</div>
            <span className="text-[9px] font-mono text-slate-400">Peak Moisture Ingress</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
              {text.volatility}
            </span>
            <div className={`text-base font-black font-mono mt-1 ${
              stats.volatility === 'High' ? 'text-rose-400' : stats.volatility === 'Moderate' ? 'text-amber-400' : 'text-emerald-400'
            }`}>
              {stats.volatility}
            </div>
            <span className="text-[9px] font-mono text-slate-400">Standard Thermal Variance</span>
          </div>

          <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
              Atmospheric Index
            </span>
            <div className="text-xs font-bold font-mono text-slate-200 mt-1 truncate" title={stats.correlationText}>
              {stats.correlationText}
            </div>
            <span className="text-[9px] font-mono text-slate-400">Regional Environmental Baseline</span>
          </div>
        </div>
      )}

      {/* Main D3 Chart Canvas Area */}
      <div className="relative bg-slate-950/90 border border-slate-800/90 rounded-xl p-4 min-h-[380px] flex flex-col justify-center items-center" ref={containerRef}>
        
        {loading && (
          <div className="flex flex-col items-center justify-center p-8 space-y-3">
            <RefreshCw className="w-8 h-8 text-orange-400 animate-spin" />
            <p className="text-xs font-mono text-slate-400 animate-pulse">{text.loading}</p>
          </div>
        )}

        {error && !loading && (
          <div className="flex flex-col items-center justify-center p-8 space-y-2 text-center">
            <ShieldAlert className="w-8 h-8 text-rose-500" />
            <p className="text-xs font-mono text-rose-400">{error}</p>
          </div>
        )}

        {!loading && !error && data.length > 0 && (
          <>
            <svg ref={svgRef} className="w-full h-[360px]"></svg>

            {/* Instruction footnote */}
            <div className="w-full flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-900">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>30-Day Continuum ({data[0]?.date} to {data[data.length - 1]?.date})</span>
              </span>
              <span>{text.hoverTip}</span>
            </div>
          </>
        )}

        {/* Hover / Touch Active Inspection Card */}
        {hoveredPoint && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-2xl backdrop-blur-md z-30 font-mono text-xs flex items-center gap-4 border-l-4 border-l-orange-500">
            <div>
              <span className="text-[10px] text-slate-400 block uppercase">Date Node</span>
              <span className="font-bold text-slate-100">{hoveredPoint.date}</span>
            </div>

            <div className="border-l border-slate-800 pl-3">
              <span className="text-[10px] text-orange-400 block uppercase">Mean Temp</span>
              <span className="font-bold text-orange-400">{hoveredPoint.temp}°C</span>
            </div>

            {hoveredPoint.tempMax !== undefined && (
              <div className="border-l border-slate-800 pl-3 hidden sm:block">
                <span className="text-[10px] text-orange-300 block uppercase">Max / Min</span>
                <span className="font-bold text-slate-200">{hoveredPoint.tempMax}° / {hoveredPoint.tempMin}°</span>
              </div>
            )}

            <div className="border-l border-slate-800 pl-3">
              <span className="text-[10px] text-cyan-400 block uppercase">Humidity</span>
              <span className="font-bold text-cyan-400">{hoveredPoint.humidity}%</span>
            </div>

            {hoveredPoint.rainfall !== undefined && hoveredPoint.rainfall > 0 && (
              <div className="border-l border-slate-800 pl-3 hidden sm:block">
                <span className="text-[10px] text-blue-400 block uppercase">Rainfall</span>
                <span className="font-bold text-blue-400">{hoveredPoint.rainfall} mm</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
