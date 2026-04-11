// frontend/src/components/reviews/ReviewCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, Trash2, Edit, MoreVertical, X, Check } from 'lucide-react';
import { useStore } from '../../store';
import toast from 'react-hot-toast';
import defaultImgProfile from '../../assets/images/default-avatar.png';

const ReviewCard = ({ review, onDelete, onUpdate }) => {
  const { user } = useStore();
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editRating, setEditRating] = useState(review.rating);
  const [editComment, setEditComment] = useState(review.comment);
  const [hoverRating, setHoverRating] = useState(0);
  const [updating, setUpdating] = useState(false);
  
  const isOwner = user?._id === review.reviewer?._id;
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diff === 0) return 'اليوم';
    if (diff === 1) return 'أمس';
    if (diff < 7) return `منذ ${diff} أيام`;
    return date.toLocaleDateString('ar-DZ');
  };
  
  const handleUpdate = async () => {
    if (editRating === 0) {
      toast.error('الرجاء اختيار عدد النجوم');
      return;
    }
    
    setUpdating(true);
    try {
      const result = await onUpdate(review._id, {
        rating: editRating,
        comment: editComment.trim()
      });
      if (result.success) {
        setIsEditing(false);
        toast.success('تم تحديث التقييم');
      }
    } catch (error) {
      toast.error('فشل تحديث التقييم');
    } finally {
      setUpdating(false);
    }
  };
  
  const handleDelete = async () => {
    if (window.confirm('هل أنت متأكد من حذف هذا التقييم؟')) {
      const result = await onDelete(review._id);
      if (result.success) {
        toast.success('تم حذف التقييم');
      }
    }
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 border border-gray-100 dark:border-gray-700">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <Link to={`/profile/${review.reviewer?.username}`}>
            <img
              src={review.reviewer?.profileImage || defaultImgProfile}
              alt={review.reviewer?.username}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary-200 dark:border-primary-800"
              onError={(e) => { e.target.src = defaultImgProfile; }}
            />
          </Link>
          <div>
            <Link 
              to={`/profile/${review.reviewer?.username}`}
              className="font-semibold text-gray-900 dark:text-white hover:text-primary-600"
            >
              {review.reviewer?.username}
            </Link>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= review.rating
                        ? 'text-yellow-500 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(review.createdAt)}
              </span>
            </div>
          </div>
        </div>
        
        {/* Actions Menu */}
        {isOwner && !isEditing && (
          <div className="relative">
            <button
              onClick={() => setShowActions(!showActions)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-gray-500" />
            </button>
            
            {showActions && (
              <div className="absolute left-0 mt-2 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                <button
                  onClick={() => {
                    setIsEditing(true);
                    setShowActions(false);
                  }}
                  className="w-full px-3 py-2 text-sm text-right flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg"
                >
                  <Edit className="w-4 h-4" />
                  تعديل
                </button>
                <button
                  onClick={handleDelete}
                  className="w-full px-3 py-2 text-sm text-right flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-b-lg"
                >
                  <Trash2 className="w-4 h-4" />
                  حذف
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Content */}
      {isEditing ? (
        <div className="space-y-3">
          {/* Edit Stars */}
          <div className="flex items-center gap-1 justify-center py-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setEditRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="focus:outline-none"
              >
                <Star
                  className={`w-8 h-8 ${
                    star <= (hoverRating || editRating)
                      ? 'text-yellow-500 fill-current'
                      : 'text-gray-300 dark:text-gray-600'
                  } transition-colors`}
                />
              </button>
            ))}
          </div>
          
          {/* Edit Comment */}
          <textarea
            value={editComment}
            onChange={(e) => setEditComment(e.target.value)}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
          />
          
          {/* Edit Actions */}
          <div className="flex items-center gap-2 justify-end">
            <button
              onClick={() => setIsEditing(false)}
              className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              إلغاء
            </button>
            <button
              onClick={handleUpdate}
              disabled={updating}
              className="px-3 py-1.5 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 flex items-center gap-1"
            >
              {updating ? 'جاري...' : 'حفظ'}
            </button>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
          {review.comment}
        </p>
      )}
    </div>
  );
};

export default ReviewCard;