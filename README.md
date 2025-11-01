# PICT OLX Frontend

A React-based marketplace application for PICT college students to buy and sell items within the campus community.

## Features

### 🔐 Authentication
- User registration with PICT email validation
- Login/logout functionality
- JWT token-based authentication
- Protected routes for authenticated users

### 🛍️ Marketplace
- Browse all available items with pagination
- Advanced filtering by category, price range, condition
- Search functionality across titles and descriptions
- Sort by price, date, etc.
- Detailed item view with image gallery

### 📝 Item Management
- Create new listings with multiple images
- Edit existing listings
- Mark items as sold
- Delete listings
- View personal listings dashboard

### ❤️ User Features
- Add/remove items from favorites
- User profile management
- Contact sellers via phone/WhatsApp
- View seller information and ratings

### 📱 Responsive Design
- Mobile-first responsive design
- Bootstrap 5 for styling
- Modern UI with smooth animations
- Cross-browser compatibility

## Tech Stack

- **React 19** - Frontend framework
- **React Router DOM** - Client-side routing
- **Bootstrap 5** - CSS framework
- **Bootstrap Icons** - Icon library
- **Fetch API** - HTTP requests
- **Local Storage** - Token persistence

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── AuthContext.jsx  # Authentication context
│   ├── Navbar.jsx       # Navigation bar
│   ├── ItemCard.jsx     # Item display card
│   ├── Filters.jsx      # Search and filter controls
│   ├── ImageUploader.jsx # Image upload component
│   └── Pagination.jsx   # Pagination component
├── pages/               # Page components
│   ├── Home.jsx         # Main marketplace page
│   ├── Login.jsx        # Login page
│   ├── Register.jsx     # Registration page
│   ├── ItemDetail.jsx   # Item details page
│   ├── CreateListing.jsx # Create new listing
│   ├── EditListing.jsx  # Edit existing listing
│   ├── MyListings.jsx   # User's listings
│   ├── Favorites.jsx    # User's favorites
│   ├── Profile.jsx      # User profile
│   └── NotFound.jsx     # 404 page
├── services/            # API services
│   ├── api.js          # Base API client
│   ├── auth.js         # Authentication service
│   └── items.js        # Items service
├── App.jsx             # Main app component
├── index.js            # App entry point
└── index.css           # Custom styles
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend server running (see server README)

### Installation

1. **Install dependencies**
   ```bash
   cd client
   npm install
   ```

2. **Environment Setup** (Optional)
   Create `.env` file in client directory:
   ```bash
   REACT_APP_API_URL=http://localhost:5000/api
   ```
   If not set, defaults to `/api` (same origin)

3. **Start development server**
   ```bash
   npm start
   ```
   Opens at http://localhost:3000

4. **Build for production**
   ```bash
   npm run build
   ```

## API Integration

The frontend integrates with the backend API through:

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Items Endpoints
- `GET /api/items` - List items with filters/pagination
- `GET /api/items/:id` - Get item details
- `POST /api/items` - Create new item
- `PUT /api/items/:id` - Update item
- `DELETE /api/items/:id` - Delete item
- `POST /api/items/:id/favorite` - Toggle favorite
- `POST /api/items/:id/sold` - Mark as sold

## Key Features Explained

### Image Upload
- Supports up to 5 images per listing
- Client-side image preview
- Base64 to File conversion for API upload
- Cloudinary integration on backend

### State Management
- React Context for authentication state
- Local state for component data
- JWT token stored in localStorage
- Automatic token refresh on API calls

### Responsive Design
- Mobile-first approach
- Bootstrap grid system
- Custom CSS for enhanced styling
- Touch-friendly interface

### Error Handling
- Global error boundaries
- API error handling with user feedback
- Form validation
- Loading states

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Development Notes

### Adding New Features
1. Create component in `src/components/`
2. Add page in `src/pages/`
3. Update routing in `App.jsx`
4. Add API service if needed

### Styling Guidelines
- Use Bootstrap classes first
- Add custom styles in `index.css`
- Follow mobile-first responsive design
- Maintain consistent color scheme

### Code Organization
- Keep components small and focused
- Use functional components with hooks
- Extract reusable logic into custom hooks
- Follow React best practices

## Troubleshooting

### Common Issues

1. **Blank page on load**
   - Check if backend is running
   - Verify API URL in environment
   - Check browser console for errors

2. **Images not uploading**
   - Verify Cloudinary configuration
   - Check file size limits (5MB max)
   - Ensure proper file types (images only)

3. **Authentication issues**
   - Clear localStorage and try again
   - Check JWT token expiration
   - Verify backend JWT_SECRET

4. **Build errors**
   - Clear node_modules and reinstall
   - Check for syntax errors
   - Verify all imports are correct

## Contributing

1. Follow existing code style
2. Add comments for complex logic
3. Test on multiple browsers
4. Ensure mobile responsiveness
5. Update documentation as needed

## License

This project is for PICT college internal use only.
