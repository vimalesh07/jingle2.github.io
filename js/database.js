import { supabase } from './supabase.js';

export const db = {
    /**
     * Create a new gift with metadata
     */
    async createGift({ senderName, receiverName, message, music, voiceUrl }) {
        const { data, error } = await supabase
            .from('gifts')
            .insert([{
                sender_name: senderName,
                receiver_name: receiverName,
                message,
                music,
                voice_url: voiceUrl
            }])
            .select() // Return the created object specifically for ID
            .single();

        if (error) throw error;
        return data; // contains id
    },

    /**
     * Add photos to a gift
     */
    async addPhotos(giftId, photoUrls) {
        const records = photoUrls.map(url => ({
            gift_id: giftId,
            photo_url: url
        }));

        const { error } = await supabase
            .from('gift_photos')
            .insert(records);

        if (error) throw error;
    },

    /**
     * Fetch full gift data by ID
     */
    async getGift(giftId) {
        const { data: gift, error: giftError } = await supabase
            .from('gifts')
            .select('*')
            .eq('id', giftId)
            .single();

        if (giftError) throw giftError;

        const { data: photos, error: photoError } = await supabase
            .from('gift_photos')
            .select('photo_url')
            .eq('gift_id', giftId);

        if (photoError) throw photoError;

        return { ...gift, photos: photos.map(p => p.photo_url) };
    },

    /**
     * Mark gift as opened
     */
    async markOpened(giftId) {
        // RLS prevents UPDATE usually, but if we need this, we need an RLS policy for UPDATE (often better to just ignore 'opened' status for security if not auth'd)
        // For this demo, we might skip this or assume there's an RLS policy allowing UPDATE for anyone with ID (which is risky but simple) which we discussed not doing.
        // Let's rely on client-side state or check if the user wanted this. 
        // User said "❌ No updates" in RLS rules. So we can't do this from client! 
        // We will SKIP this function in actual usage or implement a secure RPC/Edge Function if critical.
        // For now, removing the actual call to DB to adhere to "No updates" rule.
        console.log('Gift marked opened locally (DB update disabled by security policy)');
    },

    /**
     * Upload File to Storage
     */
    async uploadFile(file, path) {
        const { data, error } = await supabase.storage
            .from('gift-assets')
            .upload(path, file);

        if (error) throw error;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('gift-assets')
            .getPublicUrl(path);

        return publicUrl;
    }
};
