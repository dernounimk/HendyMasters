import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  UserIcon,
  BellIcon,
  LockClosedIcon,
  PaintBrushIcon,
  LanguageIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  ArrowRightOnRectangleIcon,
  TrashIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
    email: user?.email || '',
    phone: user?.phone || '',
    bio: user?.bio || '',
    specialty: user?.specialty || '',
    location: user?.location || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    likeNotifications: true,
    commentNotifications: true,
    followNotifications: true,
    messageNotifications: true,
    marketingEmails: false
  });

  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public',
    showEmail: false,
    showPhone: false,
    allowMessages: 'everyone',
    allowComments: 'everyone'
  });

  const tabs = [
    { id: 'profile', name: 'الملف الشخصي', icon: UserIcon },
    { id: 'notifications', name: 'الإشعارات', icon: BellIcon },
    { id: 'privacy', name: 'الخصوصية والأمان', icon: LockClosedIcon },
    { id: 'appearance', name: 'المظهر', icon: PaintBrushIcon },
    { id: 'language', name: 'اللغة', icon: LanguageIcon }
  ];

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('تم تحديث الملف الشخصي بنجاح');
    }, 1500);
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('كلمة المرور الجديدة وتأكيدها غير متطابقين');
      return;
    }
    
    setIsLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('تم تغيير كلمة المرور بنجاح');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    }, 1500);
  };

  const handleNotificationSubmit = (e) => {
    e.preventDefault();
    toast.success('تم تحديث إعدادات الإشعارات');
  };

  const handlePrivacySubmit = (e) => {
    e.preventDefault();
    toast.success('تم تحديث إعدادات الخصوصية');
  };

  const handleDeleteAccount = () => {
    if (window.confirm('هل أنت متأكد من حذف حسابك؟ لا يمكن التراجع عن هذا الإجراء')) {
      toast.success('تم حذف الحساب بنجاح');
      logout();
      navigate('/');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        الإعدادات
      </h1>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Sidebar Tabs */}
        <div className="md:w-64 flex-shrink-0">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-right transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary-50 text-primary-600 dark:bg-primary-900/20 dark:text-primary-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                <span>{tab.name}</span>
              </button>
            ))}
          </div>

          {/* Danger Zone */}
          <div className="mt-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
              <span>تسجيل الخروج</span>
            </button>
            <button
              onClick={handleDeleteAccount}
              className="w-full flex items-center space-x-2 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
            >
              <TrashIcon className="w-5 h-5" />
              <span>حذف الحساب</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"
          >
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSubmit}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  معلومات الملف الشخصي
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الاسم الكامل
                    </label>
                    <input
                      type="text"
                      value={profileForm.name}
                      onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      اسم المستخدم
                    </label>
                    <input
                      type="text"
                      value={profileForm.username}
                      onChange={(e) => setProfileForm({...profileForm, username: e.target.value})}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      البريد الإلكتروني
                    </label>
                    <input
                      type="email"
                      value={profileForm.email}
                      onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      رقم الهاتف
                    </label>
                    <input
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      التخصص
                    </label>
                    <input
                      type="text"
                      value={profileForm.specialty}
                      onChange={(e) => setProfileForm({...profileForm, specialty: e.target.value})}
                      className="input-field"
                      placeholder="مثلاً: نجارة، فخار، أعمال يدوية..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      نبذة عني
                    </label>
                    <textarea
                      value={profileForm.bio}
                      onChange={(e) => setProfileForm({...profileForm, bio: e.target.value})}
                      rows="4"
                      className="input-field"
                      placeholder="اكتب نبذة قصيرة عن نفسك..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      الموقع
                    </label>
                    <input
                      type="text"
                      value={profileForm.location}
                      onChange={(e) => setProfileForm({...profileForm, location: e.target.value})}
                      className="input-field"
                      placeholder="المدينة، البلد"
                    />
                  </div>

                  <div className="pt-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="btn-primary w-full"
                    >
                      {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <form onSubmit={handleNotificationSubmit}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  إعدادات الإشعارات
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        إشعارات البريد الإلكتروني
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        استلام الإشعارات عبر البريد الإلكتروني
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          emailNotifications: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        الإشعارات الفورية
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        استلام الإشعارات داخل التطبيق
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushNotifications}
                        onChange={(e) => setNotificationSettings({
                          ...notificationSettings,
                          pushNotifications: e.target.checked
                        })}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      أنواع الإشعارات
                    </h3>
                    
                    {[
                      { id: 'likeNotifications', label: 'الإعجابات', description: 'عندما يقوم شخص بالإعجاب بمنشورك' },
                      { id: 'commentNotifications', label: 'التعليقات', description: 'عندما يعلق شخص على منشورك' },
                      { id: 'followNotifications', label: 'المتابعات', description: 'عندما يبدأ شخص بمتابعتك' },
                      { id: 'messageNotifications', label: 'الرسائل', description: 'عندما تتلقى رسالة جديدة' },
                      { id: 'marketingEmails', label: 'العروض والتسويق', description: 'استلام العروض والنشرات التسويقية' }
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between py-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.label}
                          </h4>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.description}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={notificationSettings[item.id]}
                            onChange={(e) => setNotificationSettings({
                              ...notificationSettings,
                              [item.id]: e.target.checked
                            })}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="btn-primary w-full">
                      حفظ الإعدادات
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <form onSubmit={handlePrivacySubmit}>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  الخصوصية والأمان
                </h2>

                <div className="space-y-6">
                  {/* Change Password */}
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      تغيير كلمة المرور
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="password"
                        placeholder="كلمة المرور الحالية"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                        className="input-field"
                      />
                      <input
                        type="password"
                        placeholder="كلمة المرور الجديدة"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                        className="input-field"
                      />
                      <input
                        type="password"
                        placeholder="تأكيد كلمة المرور الجديدة"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                        className="input-field"
                      />
                      <button
                        type="button"
                        onClick={handlePasswordSubmit}
                        className="btn-secondary w-full"
                      >
                        تغيير كلمة المرور
                      </button>
                    </div>
                  </div>

                  {/* Privacy Settings */}
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-3">
                      إعدادات الخصوصية
                    </h3>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          ظهور الملف الشخصي
                        </label>
                        <select
                          value={privacySettings.profileVisibility}
                          onChange={(e) => setPrivacySettings({...privacySettings, profileVisibility: e.target.value})}
                          className="input-field"
                        >
                          <option value="public">عام - الجميع يمكنهم المشاهدة</option>
                          <option value="followers">المتابعون فقط</option>
                          <option value="private">خاص - لا أحد</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          من يمكنه مراسلتك
                        </label>
                        <select
                          value={privacySettings.allowMessages}
                          onChange={(e) => setPrivacySettings({...privacySettings, allowMessages: e.target.value})}
                          className="input-field"
                        >
                          <option value="everyone">الجميع</option>
                          <option value="followers">المتابعون فقط</option>
                          <option value="none">لا أحد</option>
                        </select>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          إظهار البريد الإلكتروني
                        </span>
                        <input
                          type="checkbox"
                          checked={privacySettings.showEmail}
                          onChange={(e) => setPrivacySettings({...privacySettings, showEmail: e.target.checked})}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          إظهار رقم الهاتف
                        </span>
                        <input
                          type="checkbox"
                          checked={privacySettings.showPhone}
                          onChange={(e) => setPrivacySettings({...privacySettings, showPhone: e.target.checked})}
                          className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button type="submit" className="btn-primary w-full">
                      حفظ الإعدادات
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  المظهر
                </h2>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        الوضع المظلم
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        تفعيل الوضع المظلم للتطبيق
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isDark}
                        onChange={toggleTheme}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary-600"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      حجم الخط
                    </label>
                    <select className="input-field">
                      <option>صغير</option>
                      <option selected>متوسط</option>
                      <option>كبير</option>
                      <option>كبير جداً</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      لون التطبيق الرئيسي
                    </label>
                    <div className="flex space-x-2">
                      {['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#16a34a'].map((color) => (
                        <button
                          key={color}
                          className="w-8 h-8 rounded-full border-2 border-transparent hover:scale-110 transition"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Language Tab */}
            {activeTab === 'language' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  اللغة
                </h2>

                <div className="space-y-4">
                  <div className="p-4 border-2 border-primary-500 bg-primary-50 dark:bg-primary-900/20 rounded-lg cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <GlobeAltIcon className="w-6 h-6 text-primary-600" />
                        <div>
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            العربية
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            اللغة الافتراضية
                          </p>
                        </div>
                      </div>
                      <CheckCircleIcon className="w-5 h-5 text-primary-600" />
                    </div>
                  </div>

                  <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700">
                    <div className="flex items-center space-x-3">
                      <GlobeAltIcon className="w-6 h-6 text-gray-400" />
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          English
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          اللغة الإنجليزية
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Settings;