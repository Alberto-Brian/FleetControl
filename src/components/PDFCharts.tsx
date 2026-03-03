// ========================================
// FILE: src/components/PDFCharts.tsx
// ========================================
// Gráficos SVG nativos para @react-pdf/renderer.
// Sem dependências externas — usa apenas Svg, Rect, Line, Path,
// Circle, Text do @react-pdf/renderer.
// ========================================
import React from 'react';
import { View, Text, Svg, Rect, Line, Path, Circle, G, Defs, LinearGradient, Stop } from '@react-pdf/renderer';
import { getPDFSettings, PDF_CONFIG } from '@/lib/pdf/pdf-config-react';

// ─────────────────────────────────────────────────────────────────────────────
// Helpers internos
// ─────────────────────────────────────────────────────────────────────────────

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

/** Paleta de cores para séries de dados */
function getSeriesColor(index: number, primary: string): string {
  const palette = [
    primary,
    '#10b981', '#f59e0b', '#8b5cf6', '#ef4444',
    '#06b6d4', '#f97316', '#84cc16', '#ec4899',
  ];
  return palette[index % palette.length];
}

// ─────────────────────────────────────────────────────────────────────────────
// KPI Card Row — linha de cartões de métricas no topo
// ─────────────────────────────────────────────────────────────────────────────

export interface KPICardData {
  label: string;
  value: string | number;
  sub?:  string;
  color?: string;
}

interface KPICardsProps {
  cards: KPICardData[];
}

export const KPICards: React.FC<KPICardsProps> = ({ cards }) => {
  const s = getPDFSettings();
  const count = cards.length;
  const cardW = count === 3 ? 165 : count === 4 ? 120 : 94;

  return (
    <View style={{ flexDirection: 'row', gap: 6, marginBottom: 12 }}>
      {cards.map((card, i) => {
        const bg = card.color ?? getSeriesColor(i, s.primaryColor);
        const { r, g, b } = hexToRgb(bg);
        return (
          <View
            key={i}
            style={{
              flex: 1,
              backgroundColor: bg,
              borderRadius: 6,
              padding: 10,
              minHeight: 52,
            }}
          >
            <Text style={{ fontSize: 7, color: `rgba(255,255,255,0.8)`, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {card.label}
            </Text>
            <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#ffffff', lineHeight: 1 }}>
              {String(card.value)}
            </Text>
            {card.sub && (
              <Text style={{ fontSize: 7, color: `rgba(255,255,255,0.75)`, marginTop: 2 }}>
                {card.sub}
              </Text>
            )}
          </View>
        );
      })}
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Bar Chart — gráfico de barras vertical
// ─────────────────────────────────────────────────────────────────────────────

export interface BarChartData {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data:       BarChartData[];
  title?:     string;
  width?:     number;
  height?:    number;
  formatValue?: (v: number) => string;
  showValues?: boolean;
}

export const BarChart: React.FC<BarChartProps> = ({
  data, title, width = 515, height = 130,
  formatValue = (v) => String(v), showValues = true,
}) => {
  const s       = getPDFSettings();
  const padL    = 36;
  const padR    = 8;
  const padT    = showValues ? 18 : 8;
  const padB    = 28;
  const chartW  = width  - padL - padR;
  const chartH  = height - padT - padB;

  const values  = data.map(d => d.value);
  const maxVal  = Math.max(...values, 1);
  const barGap  = 6;
  const barW    = Math.max(8, (chartW - barGap * (data.length + 1)) / data.length);
  const yTicks  = 4;

  return (
    <View style={{ marginBottom: 8 }}>
      {title && (
        <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#1e293b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Text>
      )}
      <View style={{ borderRadius: 4, overflow: 'hidden', backgroundColor: '#f8fafc', borderWidth: 0.5, borderColor: '#e2e8f0' }}>
        <Svg width={width} height={height}>
          {/* Grid lines */}
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const y = padT + (chartH / yTicks) * i;
            const val = maxVal - (maxVal / yTicks) * i;
            return (
              <G key={i}>
                <Line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#e2e8f0" strokeWidth={0.5} />
                <Text
                  style={{ fontSize: 6, fill: '#94a3b8' }}
                  // @ts-ignore
                  x={padL - 3} y={y + 2} textAnchor="end"
                >
                  {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
                </Text>
              </G>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const barH  = Math.max(2, (d.value / maxVal) * chartH);
            const x     = padL + barGap + i * (barW + barGap);
            const y     = padT + chartH - barH;
            const color = d.color ?? getSeriesColor(i, s.primaryColor);
            return (
              <G key={i}>
                <Rect x={x} y={y} width={barW} height={barH} fill={color} rx={2} />
                {/* Label abaixo */}
                <Text
                  style={{ fontSize: 6, fill: '#64748b' }}
                  // @ts-ignore
                  x={x + barW / 2} y={padT + chartH + 10} textAnchor="middle"
                >
                  {d.label.length > 8 ? d.label.slice(0, 7) + '…' : d.label}
                </Text>
                {/* Valor em cima */}
                {showValues && d.value > 0 && (
                  <Text
                    style={{ fontSize: 6, fill: '#1e293b', fontWeight: 'bold' }}
                    // @ts-ignore
                    x={x + barW / 2} y={y - 3} textAnchor="middle"
                  >
                    {formatValue(d.value)}
                  </Text>
                )}
              </G>
            );
          })}

          {/* Axis X */}
          <Line x1={padL} y1={padT + chartH} x2={width - padR} y2={padT + chartH} stroke="#cbd5e1" strokeWidth={0.8} />
          {/* Axis Y */}
          <Line x1={padL} y1={padT} x2={padL} y2={padT + chartH} stroke="#cbd5e1" strokeWidth={0.8} />
        </Svg>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Horizontal Bar Chart — ideal para rankings (top veículos, motoristas)
// ─────────────────────────────────────────────────────────────────────────────

export interface HBarChartData {
  label:  string;
  value:  number;
  color?: string;
}

interface HBarChartProps {
  data:         HBarChartData[];
  title?:       string;
  width?:       number;
  formatValue?: (v: number) => string;
}

export const HBarChart: React.FC<HBarChartProps> = ({
  data, title, width = 515,
  formatValue = (v) => String(v),
}) => {
  const s      = getPDFSettings();
  const rowH   = 18;
  const labelW = 90;
  const padX   = 8;
  const barAreaW = width - labelW - padX * 2 - 40;
  const maxVal = Math.max(...data.map(d => d.value), 1);
  const svgH   = data.length * rowH + 12;

  return (
    <View style={{ marginBottom: 8 }}>
      {title && (
        <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#1e293b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Text>
      )}
      <View style={{ borderRadius: 4, overflow: 'hidden', backgroundColor: '#f8fafc', borderWidth: 0.5, borderColor: '#e2e8f0' }}>
        <Svg width={width} height={svgH}>
          {data.map((d, i) => {
            const y      = 6 + i * rowH;
            const barW   = Math.max(4, (d.value / maxVal) * barAreaW);
            const color  = d.color ?? getSeriesColor(i, s.primaryColor);
            const bgBand = i % 2 === 0 ? '#f8fafc' : '#ffffff';
            return (
              <G key={i}>
                <Rect x={0} y={y} width={width} height={rowH} fill={bgBand} />
                {/* Label */}
                <Text
                  style={{ fontSize: 7, fill: '#1e293b', fontWeight: 'bold' }}
                  // @ts-ignore
                  x={padX} y={y + rowH / 2 + 2.5} textAnchor="start"
                >
                  {d.label.length > 14 ? d.label.slice(0, 13) + '…' : d.label}
                </Text>
                {/* Background track */}
                <Rect x={labelW} y={y + 5} width={barAreaW} height={8} fill="#e2e8f0" rx={4} />
                {/* Bar */}
                <Rect x={labelW} y={y + 5} width={barW} height={8} fill={color} rx={4} />
                {/* Value */}
                <Text
                  style={{ fontSize: 6.5, fill: '#64748b' }}
                  // @ts-ignore
                  x={labelW + barAreaW + 4} y={y + rowH / 2 + 2.5} textAnchor="start"
                >
                  {formatValue(d.value)}
                </Text>
              </G>
            );
          })}
        </Svg>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Donut / Pie Chart
// ─────────────────────────────────────────────────────────────────────────────

export interface DonutChartData {
  label:  string;
  value:  number;
  color?: string;
}

interface DonutChartProps {
  data:     DonutChartData[];
  title?:   string;
  size?:    number;
  donut?:   boolean;  // true = donut, false = pie
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data, title, size = 110, donut = true,
}) => {
  const s      = getPDFSettings();
  const cx     = size / 2;
  const cy     = size / 2;
  const R      = size / 2 - 8;
  const r      = donut ? R * 0.55 : 0;
  const total  = data.reduce((s, d) => s + d.value, 0) || 1;

  // Gerar paths de sector
  function polarToCart(angle: number, radius: number) {
    const rad = ((angle - 90) * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad) };
  }

  function sectorPath(startAngle: number, endAngle: number, outerR: number, innerR: number): string {
    const large  = endAngle - startAngle > 180 ? 1 : 0;
    const o1     = polarToCart(startAngle, outerR);
    const o2     = polarToCart(endAngle,   outerR);
    const i2     = polarToCart(endAngle,   innerR);
    const i1     = polarToCart(startAngle, innerR);
    if (innerR === 0) {
      return `M ${cx} ${cy} L ${o1.x} ${o1.y} A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y} Z`;
    }
    return [
      `M ${o1.x} ${o1.y}`,
      `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x} ${o2.y}`,
      `L ${i2.x} ${i2.y}`,
      `A ${innerR} ${innerR} 0 ${large} 0 ${i1.x} ${i1.y}`,
      'Z',
    ].join(' ');
  }

  let currentAngle = 0;
  const sectors = data.map((d, i) => {
    const angle = (d.value / total) * 360;
    const path  = sectorPath(currentAngle, currentAngle + angle - 0.5, R, r);
    currentAngle += angle;
    return { ...d, path, color: d.color ?? getSeriesColor(i, s.primaryColor) };
  });

  const legendW = 130;
  const totalW  = size + 12 + legendW;

  return (
    <View style={{ marginBottom: 8 }}>
      {title && (
        <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#1e293b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Text>
      )}
      <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f8fafc', borderRadius: 4, borderWidth: 0.5, borderColor: '#e2e8f0', padding: 8 }}>
        <Svg width={size} height={size}>
          {sectors.map((sec, i) => (
            <Path key={i} d={sec.path} fill={sec.color} />
          ))}
          {donut && (
            <Circle cx={cx} cy={cy} r={r - 1} fill="#f8fafc" />
          )}
          {donut && (
            <>
              <Text
                style={{ fontSize: 10, fontWeight: 'bold', fill: '#1e293b' }}
                // @ts-ignore
                x={cx} y={cy - 3} textAnchor="middle"
              >
                {total >= 1000 ? `${(total / 1000).toFixed(1)}k` : String(total)}
              </Text>
              <Text
                style={{ fontSize: 6, fill: '#94a3b8' }}
                // @ts-ignore
                x={cx} y={cy + 8} textAnchor="middle"
              >
                total
              </Text>
            </>
          )}
        </Svg>

        {/* Legenda lateral */}
        <View style={{ flex: 1, marginLeft: 12 }}>
          {sectors.map((sec, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
              <View style={{ width: 8, height: 8, borderRadius: 2, backgroundColor: sec.color, marginRight: 6 }} />
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 7, color: '#1e293b', fontWeight: 'bold' }}>{sec.label}</Text>
                <Text style={{ fontSize: 6.5, color: '#64748b' }}>
                  {sec.value} ({((sec.value / total) * 100).toFixed(1)}%)
                </Text>
              </View>
            </View>
          ))}
        </View>
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Line Chart — evolução ao longo do tempo
// ─────────────────────────────────────────────────────────────────────────────

export interface LineChartSeries {
  label:  string;
  data:   number[];
  color?: string;
}

interface LineChartProps {
  labels:   string[];
  series:   LineChartSeries[];
  title?:   string;
  width?:   number;
  height?:  number;
  formatValue?: (v: number) => string;
}

export const LineChart: React.FC<LineChartProps> = ({
  labels, series, title,
  width = 515, height = 120,
  formatValue = (v) => String(v),
}) => {
  const s    = getPDFSettings();
  const padL = 38;
  const padR = 12;
  const padT = 14;
  const padB = 24;
  const cW   = width  - padL - padR;
  const cH   = height - padT - padB;

  const allVals  = series.flatMap(s => s.data);
  const maxVal   = Math.max(...allVals, 1);
  const minVal   = Math.min(...allVals, 0);
  const range    = maxVal - minVal || 1;
  const yTicks   = 4;
  const xStep    = cW / Math.max(labels.length - 1, 1);

  function toSvgCoord(val: number, idx: number) {
    const x = padL + idx * xStep;
    const y = padT + cH - ((val - minVal) / range) * cH;
    return { x, y };
  }

  function makePath(data: number[]) {
    return data
      .map((v, i) => {
        const { x, y } = toSvgCoord(v, i);
        return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
      })
      .join(' ');
  }

  function makeAreaPath(data: number[]) {
    const linePart = makePath(data);
    const lastPt   = toSvgCoord(data[data.length - 1], data.length - 1);
    const firstPt  = toSvgCoord(data[0], 0);
    return `${linePart} L ${lastPt.x} ${padT + cH} L ${firstPt.x} ${padT + cH} Z`;
  }

  return (
    <View style={{ marginBottom: 8 }}>
      {title && (
        <Text style={{ fontSize: 8, fontWeight: 'bold', color: '#1e293b', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 }}>
          {title}
        </Text>
      )}
      <View style={{ borderRadius: 4, overflow: 'hidden', backgroundColor: '#f8fafc', borderWidth: 0.5, borderColor: '#e2e8f0' }}>
        <Svg width={width} height={height}>
          {/* Grid horizontais */}
          {Array.from({ length: yTicks + 1 }, (_, i) => {
            const val = minVal + (range / yTicks) * (yTicks - i);
            const y   = padT + (cH / yTicks) * i;
            return (
              <G key={i}>
                <Line x1={padL} y1={y} x2={width - padR} y2={y} stroke="#e2e8f0" strokeWidth={0.5} strokeDasharray="3,3" />
                <Text style={{ fontSize: 6, fill: '#94a3b8' }}
                  // @ts-ignore
                  x={padL - 3} y={y + 2} textAnchor="end">
                  {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val.toFixed(0)}
                </Text>
              </G>
            );
          })}

          {/* Área preenchida (apenas primeira série) */}
          {series.length > 0 && (
            <Path d={makeAreaPath(series[0].data)}
              fill={series[0].color ?? s.primaryColor}
              fillOpacity={0.08} stroke="none" />
          )}

          {/* Linhas */}
          {series.map((ser, si) => {
            const color = ser.color ?? getSeriesColor(si, s.primaryColor);
            return (
              <G key={si}>
                <Path d={makePath(ser.data)} fill="none" stroke={color} strokeWidth={1.5} />
                {/* Pontos */}
                {ser.data.map((v, i) => {
                  const { x, y } = toSvgCoord(v, i);
                  return <Circle key={i} cx={x} cy={y} r={2.5} fill={color} />;
                })}
              </G>
            );
          })}

          {/* Labels eixo X */}
          {labels.map((lbl, i) => {
            const x = padL + i * xStep;
            return (
              <Text key={i} style={{ fontSize: 6, fill: '#64748b' }}
                // @ts-ignore
                x={x} y={padT + cH + 11} textAnchor="middle">
                {lbl.length > 6 ? lbl.slice(0, 5) + '…' : lbl}
              </Text>
            );
          })}

          {/* Axes */}
          <Line x1={padL} y1={padT} x2={padL} y2={padT + cH} stroke="#cbd5e1" strokeWidth={0.8} />
          <Line x1={padL} y1={padT + cH} x2={width - padR} y2={padT + cH} stroke="#cbd5e1" strokeWidth={0.8} />
        </Svg>

        {/* Legenda */}
        {series.length > 1 && (
          <View style={{ flexDirection: 'row', gap: 12, paddingHorizontal: 8, paddingBottom: 6 }}>
            {series.map((ser, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <View style={{ width: 12, height: 2, backgroundColor: ser.color ?? getSeriesColor(i, s.primaryColor) }} />
                <Text style={{ fontSize: 6.5, color: '#64748b' }}>{ser.label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Progress Bar — barra de progresso simples (para percentagens)
// ─────────────────────────────────────────────────────────────────────────────

interface ProgressBarProps {
  value:   number;  // 0–100
  label:   string;
  color?:  string;
  height?: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ value, label, color, height = 8 }) => {
  const s   = getPDFSettings();
  const clr = color ?? s.primaryColor;
  const pct = Math.min(100, Math.max(0, value));
  return (
    <View style={{ marginBottom: 5 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 }}>
        <Text style={{ fontSize: 7, color: '#1e293b' }}>{label}</Text>
        <Text style={{ fontSize: 7, color: '#64748b', fontWeight: 'bold' }}>{pct.toFixed(1)}%</Text>
      </View>
      <View style={{ backgroundColor: '#e2e8f0', borderRadius: height / 2, height, overflow: 'hidden' }}>
        <View style={{ backgroundColor: clr, height, borderRadius: height / 2, width: `${pct}%` as any }} />
      </View>
    </View>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// Two-Column Charts Layout
// ─────────────────────────────────────────────────────────────────────────────

interface TwoColProps {
  left:  React.ReactNode;
  right: React.ReactNode;
  gap?:  number;
}

export const TwoColLayout: React.FC<TwoColProps> = ({ left, right, gap = 10 }) => (
  <View style={{ flexDirection: 'row', gap, marginBottom: 4 }}>
    <View style={{ flex: 1 }}>{left}</View>
    <View style={{ flex: 1 }}>{right}</View>
  </View>
);