// frontend/src/components/ProjectCard.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import {
  Calendar, DollarSign, Star, User, Briefcase, MapPin,
  Award, Clock, CheckCircle, MessageCircle
} from 'lucide-react';
import defaultImgProfile from '../assets/images/default-avatar.png';

const ProjectCard = ({ project, onClick }) => {
  const { t } = useTranslation();
  const [showFullReview, setShowFullReview] = useState(false);

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-DZ');
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('ar-DZ').format(amount) + ' دج';
  };

  // تحديد دور المستخدم في المشروع
  const getUserRole = () => {
    if (project.userRole) return project.userRole;
    if (project.client?._id === project.userId) return 'client';
    if (project.artisan?._id === project.userId) return 'artisan';
    if (project.worker?._id === project.userId) return 'worker';
    return project.role || 'participant';
  };

  const userRole = getUserRole();
  const isClient = userRole === 'client';
  const isArtisan = userRole === 'artisan';
  const isWorker = userRole === 'worker';

  // الحصول على الطرف الآخر في المشروع
  const getOtherParty = () => {
    if (isClient) return project.artisan || project.selectedArtisan;
    if (isArtisan) return project.client || project.author;
    if (isWorker) return project.artisan || project.author;
    return null;
  };

  const otherParty = getOtherParty();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all cursor-pointer border border-gray-100 dark:border-gray-700"
      onClick={() => onClick?.(project)}
    >
      <div className="p-5">
        {/* رأس البطاقة */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
              {project.title}
            </h3>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {formatDate(project.completedAt || project.workDetails?.endDate || project.createdAt)}
              </span>
              
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                project.status === 'completed' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {project.status === 'completed' ? 'مكتمل' : 'قيد التنفيذ'}
              </span>
            </div>
          </div>
          
          {project.budget && (
            <div className="text-right">
              <div className="text-lg font-bold text-primary-600">
                {formatCurrency(project.budget)}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('profile.jobs.budget')}
              </div>
            </div>
          )}
        </div>

        {/* الوصف */}
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* تفاصيل المشروع */}
        <div className="flex flex-wrap gap-4 mb-4">
          {project.location && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 ml-1" />
              {project.location}
            </div>
          )}
          
          {project.duration && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Clock className="w-4 h-4 ml-1" />
              {project.duration === 'one_day' ? 'يوم واحد' :
               project.duration === 'one_week' ? 'أسبوع' :
               project.duration === 'one_month' ? 'شهر' : project.customDuration}
            </div>
          )}
        </div>

        {/* الطرف الآخر */}
        {otherParty && (
          <Link
            to={`/profile/${otherParty.username}`}
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mb-4"
          >
            <img
              src={otherParty.profileImage || defaultImgProfile}
              alt={otherParty.username}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium text-gray-900 dark:text-white">
                  {otherParty.username}
                </p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  otherParty.role === 'client' 
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30'
                    : otherParty.role === 'artisan'
                    ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/30'
                    : 'bg-green-100 text-green-700 dark:bg-green-900/30'
                }`}>
                  {otherParty.role === 'client' ? 'عميل' :
                   otherParty.role === 'artisan' ? 'حرفي' : 'عامل'}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isClient ? 'تعاملت معه كحرفي' :
                 isArtisan ? 'تعاملت معه كعميل' :
                 isWorker ? 'عملت معه' : 'شريك في المشروع'}
              </p>
            </div>
          </Link>
        )}

        {/* التقييم */}
        {project.rating && (
          <div className="border-t border-gray-100 dark:border-gray-700 pt-3">
            <div className="flex items-start gap-3">
              {project.review?.reviewer && (
                <img
                  src={project.review.reviewer.profileImage || defaultImgProfile}
                  alt={project.review.reviewer.username}
                  className="w-8 h-8 rounded-full object-cover"
                />
              )}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star
                        key={star}
                        className={`w-3 h-3 ${
                          star <= Math.round(project.rating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300 dark:text-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {Number(project.rating).toFixed(1)}
                  </span>
                  {project.review?.reviewer && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      بواسطة {project.review.reviewer.username}
                    </span>
                  )}
                </div>
                {project.review?.comment && (
                  <p className={`text-sm text-gray-600 dark:text-gray-400 ${
                    !showFullReview ? 'line-clamp-2' : ''
                  }`}>
                    {project.review.comment}
                  </p>
                )}
                {project.review?.comment && project.review.comment.length > 100 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowFullReview(!showFullReview);
                    }}
                    className="text-xs text-primary-600 hover:text-primary-700 mt-1"
                  >
                    {showFullReview ? 'عرض أقل' : 'قراءة المزيد'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* شارة دور المستخدم */}
        <div className="mt-3 flex justify-end">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${
            isClient
              ? 'bg-purple-50 text-purple-700 dark:bg-purple-900/20'
              : isArtisan
              ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/20'
              : 'bg-green-50 text-green-700 dark:bg-green-900/20'
          }`}>
            <Briefcase className="w-3 h-3" />
            {isClient ? 'أنت العميل' :
             isArtisan ? 'أنت الحرفي' :
             isWorker ? 'أنت العامل' : 'مشارك'}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;