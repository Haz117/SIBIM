import { ImageResponse } from "next/og"

export const runtime = "edge"
export const size = { width: 180, height: 180 }
export const contentType = "image/png"

export default function AppleIcon() {
  const s = 180
  const r = Math.round(s * 0.219)
  const bw = Math.round(s * 0.78)
  const bh = Math.round(s * 0.68)
  const u = (v: number) => Math.round(v)

  return new ImageResponse(
    <div
      style={{
        width: s,
        height: s,
        borderRadius: r,
        background: "linear-gradient(135deg, #7c3aed 0%, #2e1065 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "50%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.13), rgba(255,255,255,0))",
        }}
      />
      <svg
        width={bw}
        height={bh}
        viewBox={`0 0 ${bw} ${bh}`}
        fill="none"
        style={{ position: "relative" }}
      >
        <rect x={0} y={u(bh * 0.88)} width={bw} height={u(bh * 0.07)} rx={u(bw * 0.016)} fill="white" opacity={0.88} />
        <rect x={u(bw * 0.04)} y={u(bh * 0.81)} width={u(bw * 0.92)} height={u(bh * 0.085)} rx={u(bw * 0.011)} fill="white" opacity={0.93} />
        <rect x={u(bw * 0.08)} y={u(bh * 0.43)} width={u(bw * 0.84)} height={u(bh * 0.39)} fill="white" opacity={0.97} />
        <polygon
          points={`${u(bw * 0.02)},${u(bh * 0.43)} ${u(bw * 0.5)},${u(bh * 0.1)} ${u(bw * 0.98)},${u(bh * 0.43)}`}
          fill="white"
          opacity={0.97}
        />
        <rect x={u(bw * 0.085)} y={u(bh * 0.42)} width={u(bw * 0.036)} height={u(bh * 0.4)} rx={u(bw * 0.009)} fill="rgba(76,29,149,0.28)" />
        <rect x={u(bw * 0.175)} y={u(bh * 0.42)} width={u(bw * 0.036)} height={u(bh * 0.4)} rx={u(bw * 0.009)} fill="rgba(76,29,149,0.28)" />
        <rect x={u(bw * 0.789)} y={u(bh * 0.42)} width={u(bw * 0.036)} height={u(bh * 0.4)} rx={u(bw * 0.009)} fill="rgba(76,29,149,0.28)" />
        <rect x={u(bw * 0.879)} y={u(bh * 0.42)} width={u(bw * 0.036)} height={u(bh * 0.4)} rx={u(bw * 0.009)} fill="rgba(76,29,149,0.28)" />
        <rect x={u(bw * 0.095)} y={u(bh * 0.475)} width={u(bw * 0.185)} height={u(bh * 0.165)} rx={u(bw * 0.012)} fill="rgba(76,29,149,0.44)" />
        <rect x={u(bw * 0.407)} y={u(bh * 0.475)} width={u(bw * 0.185)} height={u(bh * 0.165)} rx={u(bw * 0.012)} fill="rgba(76,29,149,0.44)" />
        <rect x={u(bw * 0.72)} y={u(bh * 0.475)} width={u(bw * 0.185)} height={u(bh * 0.165)} rx={u(bw * 0.012)} fill="rgba(76,29,149,0.44)" />
        <rect x={u(bw * 0.41)} y={u(bh * 0.66)} width={u(bw * 0.18)} height={u(bh * 0.15)} rx={0} fill="rgba(76,29,149,0.44)" />
        <ellipse cx={u(bw * 0.5)} cy={u(bh * 0.66)} rx={u(bw * 0.09)} ry={u(bh * 0.042)} fill="rgba(76,29,149,0.44)" />
      </svg>
    </div>,
    { ...size }
  )
}
