import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { toggleLike, retweetTweet, deleteTweet, getReplies, createReply } from '../services/api';

function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}

export default function TweetCard({ tweet, onChanged }) {
  const { user } = useAuth();
  const [showReplies, setShowReplies] = useState(false);
  const [replies, setReplies] = useState([]);
  const [replyText, setReplyText] = useState('');
  const [loadingReplies, setLoadingReplies] = useState(false);
  const [busy, setBusy] = useState(false);

  const isOwner = user && user.id === tweet.authorId;

  const handleLike = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await toggleLike(tweet.id);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const handleRetweet = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await retweetTweet(tweet.id);
      onChanged();
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Delete this tweet?')) return;
    await deleteTweet(tweet.id);
    onChanged();
  };

  const toggleShowReplies = async () => {
    if (!showReplies) {
      setLoadingReplies(true);
      try {
        const data = await getReplies(tweet.id);
        setReplies(data);
      } finally {
        setLoadingReplies(false);
      }
    }
    setShowReplies(!showReplies);
  };

  const handleReply = async () => {
    if (!replyText.trim()) return;
    const newReply = await createReply(tweet.id, replyText.trim());
    setReplies([...replies, newReply]);
    setReplyText('');
  };

  return (
    <article className="tweet-card">
      {tweet.isRetweet && (
        <div className="tweet-card__retweet-label">↻ retweeted from @{tweet.originalAuthorUsername}</div>
      )}
      <div className="tweet-card__header">
        <span className="tweet-card__author">@{tweet.authorUsername}</span>
        <span className="tweet-card__time">{timeAgo(tweet.createdAt)}</span>
      </div>
      <p className="tweet-card__content">{tweet.content}</p>
      <div className="tweet-card__actions">
        <button
          className={`tweet-card__action ${tweet.likedByCurrentUser ? 'is-active' : ''}`}
          onClick={handleLike}
        >
          ♥ {tweet.likesCount}
        </button>
        <button
          className={`tweet-card__action ${tweet.retweetedByCurrentUser ? 'is-active' : ''}`}
          onClick={handleRetweet}
        >
          ↻ {tweet.retweetsCount}
        </button>
        <button className="tweet-card__action" onClick={toggleShowReplies}>
          ⤶ {showReplies ? 'Hide' : 'Replies'}
        </button>
        {isOwner && (
          <button className="tweet-card__action tweet-card__action--danger" onClick={handleDelete}>
            Delete
          </button>
        )}
      </div>

      {showReplies && (
        <div className="tweet-card__replies">
          {loadingReplies && <p className="muted">Loading replies…</p>}
          {!loadingReplies && replies.length === 0 && <p className="muted">No replies yet.</p>}
          {replies.map((r) => (
            <div key={r.id} className="reply">
              <span className="reply__author">@{r.authorUsername}</span>
              <span className="reply__content">{r.content}</span>
            </div>
          ))}
          <div className="reply-form">
            <input
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a reply…"
              maxLength={280}
            />
            <button onClick={handleReply}>Reply</button>
          </div>
        </div>
      )}
    </article>
  );
}
