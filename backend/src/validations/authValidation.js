// التحقق من صحة بيانات التسجيل
export const validateRegister = (req, res, next) => {
  const {
    username,
    email,
    phone,
    password,
    role
  } = req.body;

  const errors = [];

  // التحقق من اسم المستخدم
  if (!username || username.length < 3) {
    errors.push('اسم المستخدم يجب أن يكون 3 أحرف على الأقل');
  }
  if (username && username.length > 30) {
    errors.push('اسم المستخدم يجب أن يكون أقل من 30 حرف');
  }
  if (username && !/^[a-zA-Z0-9_-]+$/.test(username)) {
    errors.push('اسم المستخدم يمكن أن يحتوي فقط على أحرف إنجليزية وأرقام و_ و-');
  }

  // التحقق من البريد الإلكتروني
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    errors.push('البريد الإلكتروني غير صالح');
  }

  // التحقق من رقم الهاتف (صيغة جزائرية)
  const phoneRegex = /^(05|06|07)[0-9]{8}$/;
  if (!phone || !phoneRegex.test(phone.replace(/\s/g, ''))) {
    errors.push('رقم الهاتف يجب أن يكون رقماً جزائرياً صحيحاً (05******** أو 06******** أو 07********)');
  }

  // التحقق من كلمة المرور
  if (!password || password.length < 8) {
    errors.push('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
  }
  if (password && !/[A-Z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل');
  }
  if (password && !/[a-z]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل');
  }
  if (password && !/[0-9]/.test(password)) {
    errors.push('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل');
  }

  // التحقق من الدور
  if (!role || !['client', 'artisan', 'worker'].includes(role)) {
    errors.push('نوع الحساب غير صالح');
  }

  // تحقق إضافي للحرفي
  if (role === 'artisan') {
    if (!req.body.craft) {
      errors.push('التخصص مطلوب للحرفي');
    }
    if (!req.body.experience) {
      errors.push('سنوات الخبرة مطلوبة للحرفي');
    }
  }

  // تحقق إضافي للعامل
  if (role === 'worker') {
    if (!req.body.dailyRate) {
      errors.push('السعر اليومي مطلوب للعامل');
    }
    if (req.body.dailyRate && (req.body.dailyRate < 1000 || req.body.dailyRate > 50000)) {
      errors.push('السعر اليومي يجب أن يكون بين 1000 و 50000 دينار');
    }
    if (!req.body.skills || req.body.skills.length === 0) {
      errors.push('المهارات مطلوبة للعامل');
    }
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: errors[0]
    });
  }

  next();
};

// التحقق من صحة بيانات تسجيل الدخول
export const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'البريد الإلكتروني وكلمة المرور مطلوبان'
    });
  }

  next();
};