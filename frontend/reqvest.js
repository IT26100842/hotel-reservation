const url = 'http://localhost:8080/api/rooms?';

const data = `{
    "name": "test room 2 2",
    "slug": "test-room-2-2",
    "type": "standard",
    "pricePerNight": 15000,
    "categoryId": 2,
    "currency": "LKR",
    "rating": 5,
    "reviewCount": 12,
    "location": "Bentota Beach, Sri Lanka",
    "maxGuests": 2,
    "beds": "1 King Bed",
    "baths": 1,
    "sizeSqFt": 450,
    "tag": "",
    "description": "jnfjfnf eefbse",
    "detailedDescription": "",
    "amenities": [
        "High-Speed Wi-Fi",
        "Air Conditioning",
        "Rain Shower"
    ],
    "images": [
        "https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80"
    ],
    "featured": false,
    "popular": true,
    "cancellationPolicy": "Free cancellation up to 48 hours before check-in",
    "bedType": "1 King Bed",
    "view": "Ocean View",
    "status": "available",
    "roomNumber": "701",
    "totalRooms": 5,
    "baseRoomNumber": 801
}`;

const response = await fetch(url, {
    method: 'POST',
    headers: {
        'Accept': 'application/json',
        'cookie': 'SL_GWPT_Show_Hide_tmp=1; serene_stay_admin=%7B%22id%22%3A%22usr-12%22%2C%22fullName%22%3A%22manager%22%2C%22email%22%3A%22m%40gmail.com%22%2C%22phone%22%3A%220713467890%22%2C%22city%22%3A%22Bentota%22%2C%22country%22%3A%22Sri%20Lanka%22%2C%22avatar%22%3A%22%22%2C%22preferredCurrency%22%3A%22LKR%22%2C%22memberSince%22%3A%22January%202025%22%2C%22savedRoomIds%22%3A%5B%5D%2C%22role%22%3A%22manager%22%2C%22status%22%3A%22active%22%7D',
        'x-admin-email': 'm@gmail.com',
        'x-admin-id': '12',
        'x-admin-role': 'manager',
        'Content-Type': 'application/json',
    },
    body: data,
});

const text = await response.text();

console.log(text);