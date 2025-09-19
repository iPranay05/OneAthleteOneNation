import { createClient } from '@supabase/supabase-js';

// Replace these with your actual Supabase project URL and anon key
const supabaseUrl = 'https://hzlbioejvlenxjhvrniy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh6bGJpb2VqdmxlbnhqaHZybml5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyODEyMTUsImV4cCI6MjA3Mzg1NzIxNX0.Ho4LMGrVecxzvT5-WYSZoEWQngrKUn-viq34qqa9g98';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Certificate service functions
export const certificateService = {
  // Upload certificate image to Supabase Storage
  async uploadCertificateImage(file, userId) {
    try {
      const fileExt = file.uri.split('.').pop();
      const fileName = `${userId}/${Date.now()}.${fileExt}`;
      
      const { data, error } = await supabase.storage
        .from('certificates')
        .upload(fileName, file);

      if (error) throw error;
      
      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('certificates')
        .getPublicUrl(fileName);

      return publicUrlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Save certificate data to database
  async saveCertificate(certificateData) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .insert([certificateData])
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error saving certificate:', error);
      throw error;
    }
  },

  // Get all certificates for a user
  async getUserCertificates(userId) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching certificates:', error);
      throw error;
    }
  },

  // Delete certificate
  async deleteCertificate(certificateId) {
    try {
      const { error } = await supabase
        .from('certificates')
        .delete()
        .eq('id', certificateId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting certificate:', error);
      throw error;
    }
  },

  // Update certificate
  async updateCertificate(certificateId, updates) {
    try {
      const { data, error } = await supabase
        .from('certificates')
        .update(updates)
        .eq('id', certificateId)
        .select();

      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error updating certificate:', error);
      throw error;
    }
  }
};

// SQL to create the certificates table (run this in Supabase SQL editor)
/*
CREATE TABLE certificates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  date DATE NOT NULL,
  image_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE certificates ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to only access their own certificates
CREATE POLICY "Users can only access their own certificates" ON certificates
  FOR ALL USING (auth.uid() = user_id);

-- Create storage bucket for certificate images
INSERT INTO storage.buckets (id, name, public) VALUES ('certificates', 'certificates', true);

-- Create policy for storage bucket
CREATE POLICY "Users can upload their own certificate images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own certificate images" ON storage.objects
  FOR SELECT USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own certificate images" ON storage.objects
  FOR DELETE USING (bucket_id = 'certificates' AND auth.uid()::text = (storage.foldername(name))[1]);
*/
