export interface Database {
  public: {
    Tables: {
      destinations: {
        Row: {
          id: number;
          name: string;
          rating: number;
          image: string;
          created_at: string;
        };
        Insert: {
          name: string;
          rating: number;
          image: string;
          created_at?: string;
        };
        Update: {
          name?: string;
          rating?: number;
          image?: string;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: number;
          title: string;
          venue: string;
          date: string;
          image: string;
          category: string;
          price_amount: number;
          price_currency: string;
          is_featured: boolean;
          rating: number;
          created_at: string;
          latitude: number;
          longitude: number;
          description: string;
          highlights: string[];
          venue_images: string[];
          organizer_id: string;
          sales_deadline: string;
          available_tickets: number;
        };
        Insert: {
          title: string;
          venue: string;
          date: string;
          image: string;
          category: string;
          price_amount: number;
          price_currency: string;
          is_featured?: boolean;
          rating?: number;
          created_at?: string;
          latitude: number;
          longitude: number;
          description: string;
          highlights: string[];
          venue_images: string[];
          organizer_id: string;
          sales_deadline: string;
          available_tickets: number;
        };
        Update: {
          title?: string;
          venue?: string;
          date?: string;
          image?: string;
          category?: string;
          price_amount?: number;
          price_currency?: string;
          is_featured?: boolean;
          rating?: number;
          created_at?: string;
          latitude?: number;
          longitude?: number;
          description?: string;
          highlights?: string[];
          venue_images?: string[];
          organizer_id?: string;
          sales_deadline?: string;
          available_tickets?: number;
        };
      };
      reviews: {
        Row: {
          id: number;
          event_id: number;
          user_id: string;
          rating: number;
          venue_rating: number;
          organizer_rating: number;
          comment: string;
          created_at: string;
        };
        Insert: {
          event_id: number;
          user_id: string;
          rating: number;
          venue_rating: number;
          organizer_rating: number;
          comment: string;
          created_at?: string;
        };
        Update: {
          rating?: number;
          venue_rating?: number;
          organizer_rating?: number;
          comment?: string;
          created_at?: string;
        };
      };
      messages: {
        Row: {
          id: number;
          user_id: string;
          text: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          text: string;
          created_at?: string;
        };
        Update: {
          user_id?: string;
          text?: string;
          created_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          username: string;
          avatar_url: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          username: string;
          avatar_url?: string;
          updated_at?: string;
        };
        Update: {
          username?: string;
          avatar_url?: string;
          updated_at?: string;
        };
      };
    };
  };
}