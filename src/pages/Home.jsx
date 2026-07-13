import { useState, useEffect, useCallback } from 'react';
import { getAllTweets, getMyFeed, createTweet } from '../services/api';
import TweetCard from '../components/TweetCard';

export default function Home() {
  const [tab, setTab] = useState('all'); // 'all' | 'mine'
  const [tweets, setTweets] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [posting, setPosting] = useState(false);

  const loadTweets = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = tab === 'all' ? await getAllTweets() : await getMyFeed();
      setTweets(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load tweets.');
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    loadTweets();
  }, [loadTweets]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!content.trim() || posting) return;
    setPosting(true);
    setError('');
    try {
      await createTweet(content.trim());
      setContent('');
      await loadTweets();
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post tweet.');
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="page">
      <form className="composer" onSubmit={handlePost}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening?"
          maxLength={280}
          rows={3}
        />
        <div className="composer__row">
          <span className="composer__count">{content.length}/280</span>
          <button type="submit" disabled={posting || !content.trim()}>
            {posting ? 'Posting…' : 'Tweet'}
          </button>
        </div>
      </form>

      {error && <div className="alert">{error}</div>}

      <div className="tabs">
        <button className={tab === 'all' ? 'is-active' : ''} onClick={() => setTab('all')}>All Tweets</button>
        <button className={tab === 'mine' ? 'is-active' : ''} onClick={() => setTab('mine')}>My Feed</button>
      </div>

      <h2 className="section-title">{tab === 'all' ? `All Tweets (${tweets.length})` : `My Feed (${tweets.length})`}</h2>

      {loading && <p className="muted">Loading…</p>}
      {!loading && tweets.length === 0 && <p className="muted">Nothing here yet.</p>}
      {!loading && tweets.map((tweet) => (
        <TweetCard key={tweet.id} tweet={tweet} onChanged={loadTweets} />
      ))}
    </div>
  );
}
