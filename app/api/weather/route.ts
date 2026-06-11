import { NextResponse } from "next/server"

// Maps Open-Meteo WMO weather codes to a short label + icon key.
function describe(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "Clear sky", icon: "sun" }
  if (code <= 2) return { label: "Partly cloudy", icon: "cloud-sun" }
  if (code === 3) return { label: "Overcast", icon: "cloud" }
  if (code <= 48) return { label: "Foggy", icon: "cloud" }
  if (code <= 57) return { label: "Drizzle", icon: "cloud-rain" }
  if (code <= 67) return { label: "Rain", icon: "cloud-rain" }
  if (code <= 77) return { label: "Snow", icon: "snow" }
  if (code <= 82) return { label: "Rain showers", icon: "cloud-rain" }
  if (code <= 86) return { label: "Snow showers", icon: "snow" }
  if (code <= 99) return { label: "Thunderstorm", icon: "cloud-rain" }
  return { label: "Unknown", icon: "cloud" }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const place = searchParams.get("place")?.trim()

  if (!place) {
    return NextResponse.json({ error: "Missing place" }, { status: 400 })
  }

  try {
    // 1) Geocode the destination (keyless Open-Meteo geocoding API).
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      place,
    )}&count=1&language=en&format=json`
    const geoRes = await fetch(geoUrl, { next: { revalidate: 86400 } })
    const geo = await geoRes.json()
    const loc = geo?.results?.[0]

    if (!loc) {
      return NextResponse.json(
        { error: `Couldn't find "${place}"` },
        { status: 404 },
      )
    }

    // 2) Fetch current weather for those coordinates.
    const wxUrl = `https://api.open-meteo.com/v1/forecast?latitude=${loc.latitude}&longitude=${loc.longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,weather_code,wind_speed_10m&timezone=auto`
    const wxRes = await fetch(wxUrl, { next: { revalidate: 900 } })
    const wx = await wxRes.json()
    const current = wx?.current

    if (!current) {
      return NextResponse.json(
        { error: "Weather unavailable" },
        { status: 502 },
      )
    }

    const { label, icon } = describe(current.weather_code)

    return NextResponse.json({
      place: `${loc.name}${loc.country ? `, ${loc.country}` : ""}`,
      temperature: Math.round(current.temperature_2m),
      feelsLike: Math.round(current.apparent_temperature),
      humidity: current.relative_humidity_2m,
      windSpeed: Math.round(current.wind_speed_10m),
      label,
      icon,
    })
  } catch {
    return NextResponse.json({ error: "Weather lookup failed" }, { status: 500 })
  }
}
