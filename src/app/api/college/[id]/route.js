import { NextResponse } from 'next/server';
import { API_URL } from '@/config';
import { mockCollegeDetails } from '@/lib/mock-college-details';

export async function GET(request, { params }) {
  try {
    // Await params before destructuring
    const { id } = params;
    
    // Check if this is a test request
    const { searchParams } = new URL(request.url);
    const isTestMode = searchParams.get('test') === 'true';
    
    if (isTestMode) {
      console.log(`[TEST MODE] Fetching college ${id} directly from backend`);
    }
    
    // Forward to the backend API
    const apiUrl = `${API_URL}/api/colleges/${id}`;
    
    try {
      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        // If the backend returns an error, we handle it
        const errorData = await response.json();
        return NextResponse.json(
          { error: errorData.message || 'Failed to fetch college details' },
          { status: response.status }
        );
      }
      
      const collegeData = await response.json();
      return NextResponse.json(collegeData);
      
    } catch (fetchError) {
      console.error('Error fetching from backend:', fetchError);
      
      // In development, fall back to mock data if backend is not available
      // BUT never use mock data in test mode
      if (process.env.NODE_ENV === 'development' && !isTestMode) {
        console.log('Using mock data for college details in development');
        const mockCollege = mockCollegeDetails[id];
        
        if (mockCollege) {
          return NextResponse.json(mockCollege);
        } else {
          return NextResponse.json(
            { error: 'College not found' },
            { status: 404 }
          );
        }
      }
      
      // In production, return a proper error
      return NextResponse.json(
        { error: 'Unable to connect to college data service' },
        { status: 503 }
      );
    }
    
  } catch (error) {
    console.error('API route error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 