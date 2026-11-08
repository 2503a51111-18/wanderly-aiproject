
from sqlalchemy import select
from .models import Destination, Attraction, Hotel


def seed_data(db):
    # Add only missing destinations.
    destinations = [
        Destination(
            name="Hyderabad",
            state="Telangana",
            category="History • Food • Culture",
            rating=4.7,
            description="Historic landmarks, food and modern city experiences.",
            estimated_daily_cost=2200,
        ),
        Destination(
            name="Goa",
            state="Goa",
            category="Beaches • Relax • Nightlife",
            rating=4.8,
            description="Beaches, heritage streets and leisure experiences.",
            estimated_daily_cost=3000,
        ),
        Destination(
            name="Kerala",
            state="Kerala",
            category="Nature • Backwaters • Wellness",
            rating=4.9,
            description="Backwaters, nature and wellness experiences.",
            estimated_daily_cost=2800,
        ),
        Destination(
            name="Jaipur",
            state="Rajasthan",
            category="Forts • Heritage • Shopping",
            rating=4.6,
            description="Forts, palaces, markets and heritage experiences.",
            estimated_daily_cost=2400,
        ),
        Destination(
            name="Bali",
            state="Indonesia",
            category="International • Beaches • Nature",
            rating=4.8,
            description="Tropical beaches, rice terraces and cultural temples.",
            estimated_daily_cost=6500,
        ),
        Destination(
            name="Dubai",
            state="United Arab Emirates",
            category="International • Shopping • Adventure",
            rating=4.7,
            description="Modern architecture, desert safaris and shopping.",
            estimated_daily_cost=9000,
        ),
        Destination(
            name="Singapore",
            state="Singapore",
            category="International • City • Family",
            rating=4.8,
            description="Gardens, waterfront attractions and vibrant city life.",
            estimated_daily_cost=11000,
        ),
        Destination(
            name="Switzerland",
            state="Switzerland",
            category="International • Mountains • Nature",
            rating=4.9,
            description="Alpine villages, scenic railways and mountain lakes.",
            estimated_daily_cost=18000,
        ),
        Destination(
            name="Japan",
            state="Japan",
            category="International • Culture • Mountains",
            rating=4.9,
            description="Historic temples, modern cities and beautiful landscapes.",
            estimated_daily_cost=13000,
        ),
        Destination(
            name="Wayanad",
            state="Kerala",
            category="Forest • Wildlife • Nature",
            rating=4.7,
            description="Lush forests, waterfalls and wildlife experiences.",
            estimated_daily_cost=2500,
        ),
        Destination(
            name="Dandeli",
            state="Karnataka",
            category="Forest • Wildlife • Adventure",
            rating=4.6,
            description="Forest trails, river adventures and wildlife.",
            estimated_daily_cost=2300,
        ),
        Destination(
            name="Jim Corbett",
            state="Uttarakhand",
            category="Forest • Wildlife • Nature",
            rating=4.7,
            description="Forest landscapes and guided wildlife safaris.",
            estimated_daily_cost=4000,
        ),
        Destination(
            name="Kaziranga",
            state="Assam",
            category="Forest • Wildlife • Nature",
            rating=4.8,
            description="Grasslands, wetlands and guided wildlife tours.",
            estimated_daily_cost=3500,
        ),
    ]

    existing_destinations = set(
        db.scalars(select(Destination.name)).all()
    )

    for destination in destinations:
        if destination.name not in existing_destinations:
            db.add(destination)

    db.flush()

    # Add only missing attractions.
    attractions = [
        ("Hyderabad", "Charminar", "History", 100,
         "Iconic historic monument."),
        ("Hyderabad", "Golconda Fort", "History", 200,
         "Fort complex with panoramic views."),
        ("Hyderabad", "Laad Bazaar", "Shopping", 0,
         "Traditional shopping street."),
        ("Hyderabad", "Birla Mandir", "Culture", 0,
         "Hilltop temple and city views."),
        ("Goa", "Baga Beach", "Beaches", 0,
         "Popular beach destination."),
        ("Goa", "Old Goa", "History", 100,
         "Heritage churches and architecture."),
        ("Kerala", "Alleppey Backwaters", "Nature", 1200,
         "Scenic backwater experience."),
        ("Kerala", "Munnar", "Nature", 300,
         "Tea estates and mountain scenery."),
        ("Jaipur", "Amber Fort", "History", 500,
         "Historic hill fort."),
        ("Jaipur", "City Palace", "History", 400,
         "Royal palace complex."),
        ("Bali", "Ubud Rice Terraces", "Nature", 500,
         "Scenic tropical rice terraces."),
        ("Bali", "Uluwatu Temple", "Culture", 400,
         "Clifftop temple overlooking the ocean."),
        ("Dubai", "Burj Khalifa", "Sightseeing", 1800,
         "Famous observation deck and city views."),
        ("Singapore", "Gardens by the Bay", "Nature", 1200,
         "Iconic waterfront gardens."),
        ("Switzerland", "Lake Lucerne", "Nature", 0,
         "Scenic lake surrounded by mountains."),
        ("Japan", "Fushimi Inari Shrine", "Culture", 0,
         "Historic shrine with iconic torii gates."),
        ("Wayanad", "Edakkal Caves", "Nature", 100,
         "Caves featuring ancient carvings."),
        ("Dandeli", "Kali River", "Adventure", 500,
         "River scenery and guided activities."),
        ("Jim Corbett", "Corbett National Park", "Wildlife", 1000,
         "Protected landscape with guided safaris."),
        ("Kaziranga", "Kaziranga National Park", "Wildlife", 1000,
         "Protected grasslands and wildlife safaris."),
    ]

    existing_attractions = set(
        db.execute(
            select(Attraction.destination, Attraction.name)
        ).all()
    )

    for destination, name, category, cost, description in attractions:
        if (destination, name) not in existing_attractions:
            db.add(
                Attraction(
                    destination=destination,
                    name=name,
                    category=category,
                    cost=cost,
                    description=description,
                )
            )

    # Add only missing hotels.
    hotels = [
        ("Wanderly Grand Hyderabad", "Hyderabad", 3200, 4.5, 8),
        ("Charminar View Stay", "Hyderabad", 2100, 4.2, 6),
        ("Goa Beach Resort", "Goa", 4500, 4.6, 7),
        ("Kerala Backwater Retreat", "Kerala", 3900, 4.7, 5),
        ("Jaipur Heritage Palace", "Jaipur", 3500, 4.5, 6),
        ("Bali Tropical Retreat", "Bali", 5000, 4.6, 6),
        ("Dubai City Hotel", "Dubai", 7000, 4.5, 8),
        ("Singapore Garden Hotel", "Singapore", 8500, 4.6, 5),
        ("Swiss Alpine Lodge", "Switzerland", 14000, 4.8, 4),
        ("Tokyo Sakura Hotel", "Japan", 8000, 4.7, 7),
        ("Wayanad Forest Stay", "Wayanad", 2800, 4.5, 5),
        ("Dandeli Nature Resort", "Dandeli", 2500, 4.4, 6),
        ("Corbett Wilderness Resort", "Jim Corbett", 4500, 4.6, 5),
        ("Kaziranga Eco Lodge", "Kaziranga", 3200, 4.5, 4),
    ]

    existing_hotels = set(
        db.scalars(select(Hotel.name)).all()
    )

    for name, city, price, rating, rooms in hotels:
        if name not in existing_hotels:
            db.add(
                Hotel(
                    name=name,
                    city=city,
                    price_per_night=price,
                    rating=rating,
                    rooms_available=rooms,
                )
            )

    db.commit()
