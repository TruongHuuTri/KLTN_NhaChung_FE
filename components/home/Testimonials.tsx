"use client";

import { useEffect, useMemo, useState } from 'react';
import { getAllReviews, voteReview } from '@/services/reviews';
import { getUserById } from '@/services/user';
import { extractApiErrorMessage } from '@/utils/api';
import { useAuth } from '@/contexts/AuthContext';

type ReviewCard = {
  id: number;
  reviewId: number;
  writerId?: number;
  name: string;
  text: string;
  rating: number;
  avatar: string;
  createdAt?: string;
  media?: string[];
  targetType?: 'USER' | 'ROOM' | 'BUILDING' | 'POST';
  votesHelpful?: number;
  votesUnhelpful?: number;
  myVote?: 'helpful' | 'unhelpful' | null;
};

const AVATARS = ["/home/avt1.png", "/home/avt2.png", "/home/avt3.png"]; // fallback

export default function Testimonials(){
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cards, setCards] = useState<ReviewCard[]>([]);
  // Trang chủ chỉ hiển thị và vote, không có form tạo
  const [voteModalReviewId, setVoteModalReviewId] = useState<number | null>(null);
  const [voteChoice, setVoteChoice] = useState<'helpful' | 'unhelpful' | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        // Dùng endpoint lấy tất cả reviews theo tài liệu: GET /reviews/all
        const res = await getAllReviews({ sort: 'recent', page: 1, pageSize: 9 });
        const allItems: any[] = res?.items || [];

        // Enrich writer info (name, avatar) from user profile
        const uniqueWriterIds = Array.from(new Set(allItems.map((r: any) => r?.writerId).filter(Boolean)));
        const idToProfile: Record<number, { name?: string; avatar?: string }> = {};
        await Promise.all(uniqueWriterIds.map(async (uid) => {
          try {
            const u = await getUserById(uid);
            idToProfile[uid] = { name: u?.name, avatar: u?.avatar };
          } catch {}
        }));

        const mapped: ReviewCard[] = allItems
          .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
          .map((r, idx) => ({
            id: r.reviewId ?? idx,
            reviewId: r.reviewId ?? idx,
            writerId: r.writerId,
            name: r.isAnonymous ? 'Ẩn danh' : (idToProfile[r.writerId]?.name || `Khách hàng #${r.writerId}`),
            text: r.content || 'Không có nội dung',
            rating: r.rating || 0,
            avatar: (r.isAnonymous ? undefined : idToProfile[r.writerId]?.avatar) || AVATARS[idx % AVATARS.length],
            createdAt: r.createdAt,
            media: Array.isArray(r.media) ? r.media : [],
            targetType: r.targetType,
            votesHelpful: typeof r.votesHelpful === 'number' ? r.votesHelpful : 0,
            votesUnhelpful: typeof r.votesUnhelpful === 'number' ? r.votesUnhelpful : 0,
            myVote: null,
          }));

        setCards(mapped);
      } catch (err: any) {
        setError(extractApiErrorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const displayedItems = useMemo(() => (showAll ? cards : cards.slice(0, 6)), [showAll, cards]);

  return (
    <section className="py-8 bg-gray-50">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h3 className="text-2xl md:text-3xl font-bold text-teal-600 mb-6">Đánh giá của khách hàng</h3>
        {loading ? (
          <div className="py-8 text-center text-gray-500">Đang tải đánh giá...</div>
        ) : error ? (
          <div className="py-8 text-center text-red-600">{error}</div>
        ) : displayedItems.length === 0 ? (
          <div className="py-8 text-center text-gray-500">Chưa có đánh giá</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-5">
            {displayedItems.map((it)=> (
              <div key={it.id} className="rounded-2xl bg-white p-5 shadow-lg border border-slate-200 hover:shadow-xl transition-shadow">
                <div className="flex items-center gap-3">
                  <img 
                    src={it.avatar} 
                    alt={it.name}
                    className="w-12 h-12 rounded-full object-cover border-2 border-teal-100"
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-gray-900">{it.name}</p>
                      {it.targetType && (
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                          {it.targetType === 'ROOM' ? 'Phòng' : it.targetType === 'USER' ? 'Chủ trọ/Người dùng' : it.targetType === 'BUILDING' ? 'Tòa nhà' : 'Bài đăng'}
                        </span>
                      )}
                    </div>
                    <p className="text-yellow-400 text-sm">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i}>{i < it.rating ? '★' : '☆'}</span>
                      ))}
                    </p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-700 leading-relaxed">{it.text}</p>
                {(() => { const mediaList = Array.isArray(it.media) ? it.media : []; return mediaList.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {mediaList.slice(0, 3).map((url, idx) => (
                      <div key={idx} className="relative w-16 h-16 border rounded overflow-hidden">
                        <img src={url} alt="review-media" className="w-full h-full object-cover" />
                        {idx === 2 && mediaList.length > 3 && (
                          <div className="absolute inset-0 bg-black/50 text-white text-xs flex items-center justify-center">
                            +{mediaList.length - 3}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : null })()}
                {it.createdAt && (
                  <p className="mt-2 text-xs text-gray-400">{new Date(it.createdAt).toLocaleDateString('vi-VN')}</p>
                )}
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-4 text-xs">
                    <span className="inline-flex items-center gap-1 text-teal-700">
                      <span>Hữu ích</span>
                      <span className="px-1 rounded bg-teal-50 border border-teal-200 text-teal-700">{it.votesHelpful ?? 0}</span>
                    </span>
                    <span className="inline-flex items-center gap-1 text-gray-600">
                      <span>Không hữu ích</span>
                      <span className="px-1 rounded bg-gray-100 border border-gray-300 text-gray-700">{it.votesUnhelpful ?? 0}</span>
                    </span>
                  </div>
                  <div>
                    <button
                      type="button"
                      className="text-xs px-3 py-1 rounded-lg border border-teal-300 text-teal-700 hover:bg-teal-50 disabled:text-gray-400 disabled:border-gray-300"
                      disabled={!user || it.myVote != null}
                      onClick={() => { setVoteModalReviewId(it.reviewId); setVoteChoice(null); }}
                    >
                      Vote
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
        {cards.length > 6 && (
          <div className="text-center mt-6">
            <button 
              onClick={() => setShowAll(!showAll)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-medium transition-colors"
            >
              {showAll ? 'Thu gọn' : 'Xem thêm đánh giá'}
              <svg 
                className={`w-5 h-5 transition-transform ${showAll ? 'rotate-180' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>
        )}
        {/* Vote Modal */}
        {voteModalReviewId != null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white w-full max-w-sm rounded-xl shadow-lg p-5">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-base font-semibold text-gray-900">Bạn đánh giá review này?</h4>
                <button className="text-gray-500 hover:text-gray-700" onClick={() => { setVoteModalReviewId(null); setVoteChoice(null); }}>✕</button>
              </div>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <button
                  type="button"
                  onClick={() => setVoteChoice('helpful')}
                  className={`px-4 py-2 rounded-lg border ${voteChoice === 'helpful' ? 'bg-teal-600 text-white border-teal-600' : 'border-teal-300 text-teal-700 hover:bg-teal-50'}`}
                >
                  Hữu ích
                </button>
                <button
                  type="button"
                  onClick={() => setVoteChoice('unhelpful')}
                  className={`px-4 py-2 rounded-lg border ${voteChoice === 'unhelpful' ? 'bg-gray-700 text-white border-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'}`}
                >
                  Không hữu ích
                </button>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-700"
                  onClick={() => { setVoteModalReviewId(null); setVoteChoice(null); }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  disabled={!user || !voteChoice}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${(!user || !voteChoice) ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-teal-600 text-white hover:bg-teal-700'}`}
                  onClick={async () => {
                    if (!user || !voteChoice) return;
                    const reviewId = voteModalReviewId as number;
                    try {
                      await voteReview(reviewId, Number((user as any).userId ?? (user as any).id), voteChoice === 'helpful');
                      setCards(prev => prev.map(c => {
                        if (c.reviewId !== reviewId) return c;
                        if (voteChoice === 'helpful') {
                          return { ...c, votesHelpful: (c.votesHelpful || 0) + 1, myVote: 'helpful' };
                        }
                        return { ...c, votesUnhelpful: (c.votesUnhelpful || 0) + 1, myVote: 'unhelpful' };
                      }));
                      setVoteModalReviewId(null);
                      setVoteChoice(null);
                    } catch (err: any) {
                      alert(extractApiErrorMessage(err));
                    }
                  }}
                >
                  Gửi vote
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}