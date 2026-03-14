const SUPABASE_URL  = 'https://fnxblvgvcxndunjbyute.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZueGJsdmd2Y3huZHVuamJ5dXRlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM0NDQ4NTYsImV4cCI6MjA4OTAyMDg1Nn0.IRkDJjwXNS3uYc9yQkg_Qch1QX6Xv4lZjTfmC-hs58M';

const _supa = supabase.createClient(SUPABASE_URL, SUPABASE_ANON);

const Auth = {
  async signUp(email, password, name) {
    return await _supa.auth.signUp({
      email, password,
      options: { data: { full_name: name } }
    });
  },
  async signIn(email, password) {
    return await _supa.auth.signInWithPassword({ email, password });
  },
  async signOut() {
    await _supa.auth.signOut();
    window.location.href = 'index.html';
  },
  async getUser() {
    const { data: { user } } = await _supa.auth.getUser();
    return user;
  },
  async requireAuth(redirectTo = 'login.html') {
    const user = await this.getUser();
    if (!user) { window.location.href = redirectTo; return null; }
    return user;
  },
  async redirectIfAuthed(to = 'dashboard.html') {
    const user = await this.getUser();
    if (user) window.location.href = to;
  }
};

const DB = {
  async getDetails(userId) {
    return await _supa.from('user_details').select('*').eq('user_id', userId).maybeSingle();
  },
  async upsertDetails(userId, payload) {
    return await _supa.from('user_details')
      .upsert({ ...payload, user_id: userId, updated_at: new Date().toISOString() }, { onConflict: 'user_id' })
      .select().single();
  },
  async patchDetails(userId, fields) {
    return await _supa.from('user_details')
      .update({ ...fields, updated_at: new Date().toISOString() })
      .eq('user_id', userId).select().single();
  }
};