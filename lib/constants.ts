export const DEMO_USER_ID = "1"

export const SAMPLE_CONFIRMATION = `Flight Confirmation
Japan Airlines JL6
From: New York JFK Terminal 1
To: Tokyo HND
Depart: September 15, 2024 at 12:15 PM
Arrive: September 16, 2024 at 3:25 PM JST
Gate: 4
Seat: 12A
Status: On Time

Hotel Reservation
Shibuya Stream Excel Hotel Tokyu
3-21-3 Shibuya, Shibuya City, Tokyo, Japan
Check-in: 3:00 PM
Check-out: 11:00 AM
Confirmation: X992-H8B
Room Type: Standard Double

Dinner at Narisawa Restaurant
8:30 PM - 10:00 PM
2-6-15 Minami-Aoyama, Minato Ward, Tokyo
Seats: 2 people`

export const SAMPLE_TRIPS = [
  {
    id: "sample-1",
    name: "Tokyo Trip",
    emoji: "🗾",
    data: SAMPLE_CONFIRMATION,
  },
  {
    id: "sample-2",
    name: "NYC Weekend",
    emoji: "🗽",
    data: `Flight Confirmation
United Airlines UA456
From: Los Angeles LAX
To: New York JFK Terminal 4
Depart: October 1, 2024 at 5:30 PM
Arrive: October 2, 2024 at 1:45 AM EDT
Gate: 67
Seat: 8F
Status: On Time

Hotel Reservation
The Plaza Hotel
Fifth Avenue at Central Park South, New York, NY
Check-in: 2:00 PM
Check-out: 11:00 AM
Confirmation: NYC-2024-789
Room Type: Superior

Broadway Show
Hamilton - Richard Rodgers Theatre
7:30 PM - 10:15 PM
226 W 46th St, New York, NY
Tickets: 2 Orchestra seats`,
  },
  {
    id: "sample-3",
    name: "Paris Getaway",
    emoji: "🗼",
    data: `Flight Confirmation
Air France AF102
From: Boston BOS
To: Paris CDG Terminal 2
Depart: October 10, 2024 at 7:00 PM
Arrive: October 11, 2024 at 8:30 AM CEST
Gate: 52
Seat: 2A
Status: On Time

Hotel Reservation
Hotel Le Marais Paris
31 Rue de Sévigné, 75003 Paris
Check-in: 3:00 PM
Check-out: 11:00 AM
Confirmation: PARIS-2024-556
Room Type: Deluxe

Dinner Reservation
Michelin Star Restaurant L'Astrance
4 Rue Beethoven, 75016 Paris
8:00 PM - 10:30 PM
Party of 2`,
  },
]
