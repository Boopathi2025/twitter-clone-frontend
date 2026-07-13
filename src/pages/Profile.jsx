import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getUserByUsername, getTweetsByAuthor, updateProfile, uploadProfileImage } from '../services/api';
import TweetCard from '../components/TweetCard';

export default function Profile() {
  const { username } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [tweets, setTweets] = useState([]);
  const [bio, setBio] = useState('');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const isOwnProfile = currentUser && currentUser.username === username;

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const profileData = await getUserByUsername(username);
      setProfile(profileData);
      setBio(profileData.bio || '');
      const tweetData = await getTweetsByAuthor(profileData.id);
      setTweets(tweetData);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load profile.');
    } finally {
      setLoading(false);
    }
  }, [username]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSaveBio = async () => {
    setSaving(true);
    try {
      const updated = await updateProfile({ bio });
      setProfile(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const updated = await uploadProfileImage(file);
    setProfile(updated);
  };

  if (loading) return <div className="page"><p className="muted">Loading…</p></div>;
  if (error) return <div className="page"><div className="alert">{error}</div></div>;
  if (!profile) return null;

  return (
    <div className="page">
      <div className="profile-header">
        <div className="profile-header__avatar-wrap">
          {profile.profileImageUrl ? (
            <img
              className="profile-header__avatar"
              src={profile.profileImageUrl.startsWith('http') ? profile.profileImageUrl : `${import.meta.env.VITE_API_URL?.replace('/api', '') || ''}${profile.profileImageUrl}`}
              alt={profile.username}
            />
          ) : (
            <div className="profile-header__avatar profile-header__avatar--placeholder">
              {profile.username[0].toUpperCase()}
            </div>
          )}
          {isOwnProfile && (
            <label className="profile-header__upload">
              Change
              <input type="file" accept="image/*" onChange={handleImageUpload} hidden />
            </label>
          )}
        </div>
        <div className="profile-header__info">
          <h1>@{profile.username}</h1>
          <p className="muted">{profile.email}</p>
          {editing ? (
            <div className="profile-header__edit">
              <textarea value={bio} onChange={(e) => setBio(e.target.value)} maxLength={160} rows={2} />
              <div>
                <button onClick={handleSaveBio} disabled={saving}>{saving ? 'Saving…' : 'Save'}</button>
                <button onClick={() => setEditing(false)} className="ghost">Cancel</button>
              </div>
            </div>
          ) : (
            <>
              <p>{profile.bio || <span className="muted">No bio yet.</span>}</p>
              {isOwnProfile && <button className="ghost" onClick={() => setEditing(true)}>Edit bio</button>}
            </>
          )}
        </div>
      </div>

      <h2 className="section-title">Tweets ({tweets.length})</h2>
      {tweets.length === 0 && <p className="muted">No tweets yet.</p>}
      {tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} onChanged={load} />
      ))}
    </div>
  );
}
