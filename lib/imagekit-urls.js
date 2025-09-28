// Helper function to get ImageKit URLs for assets
const IMAGEKIT_URL = process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || 'https://ik.imagekit.io/osmanabdout';

export const getImageKitUrl = (assetPath) => {
    // Remove leading slash if present
    const cleanPath = assetPath.startsWith('/') ? assetPath.slice(1) : assetPath;
    return `${IMAGEKIT_URL}/${cleanPath}`;
};

// Asset URLs mapping - matches the original assets.js structure
export const imagekitAssets = {
    // Logos and branding
    gs_logo: getImageKitUrl('assets/gs_logo.jpg'),
    happy_store: getImageKitUrl('assets/happy_store.webp'),
    upload_area: getImageKitUrl('assets/upload_area.svg'),
    logo_en: getImageKitUrl('assets/logo-en.svg'),
    logo_ar: getImageKitUrl('assets/logo-ar.svg'),

    // Store badges
    googleplay: getImageKitUrl('assets/googleplay.svg'),
    appstore: getImageKitUrl('assets/appstore.svg'),
    gift: getImageKitUrl('assets/gift.jpg'),

    // Payment methods
    visa: getImageKitUrl('assets/visa.svg'),
    mada: getImageKitUrl('assets/mada.svg'),
    masterCard: getImageKitUrl('assets/master-card.svg'),
    applePay: getImageKitUrl('assets/apple-pay.svg'),
    americanExpress: getImageKitUrl('assets/american-express.svg'),
    tamara: getImageKitUrl('assets/tamara.svg'),
    tabby: getImageKitUrl('assets/tabby.svg'),

    // Hero images
    hero_model_img: getImageKitUrl('assets/hero_model_img.png'),
    hero_product_img1: getImageKitUrl('assets/hero_product_img1.png'),
    hero_product_img2: getImageKitUrl('assets/hero_product_img2.png'),

    // Product images
    product_img1: getImageKitUrl('assets/product_img1.png'),
    product_img2: getImageKitUrl('assets/product_img2.png'),
    product_img3: getImageKitUrl('assets/product_img3.png'),
    product_img4: getImageKitUrl('assets/product_img4.png'),
    product_img5: getImageKitUrl('assets/product_img5.png'),
    product_img6: getImageKitUrl('assets/product_img6.png'),
    product_img7: getImageKitUrl('assets/product_img7.png'),
    product_img8: getImageKitUrl('assets/product_img8.png'),
    product_img9: getImageKitUrl('assets/product_img9.png'),
    product_img10: getImageKitUrl('assets/product_img10.png'),
    product_img11: getImageKitUrl('assets/product_img11.png'),
    product_img12: getImageKitUrl('assets/product_img12.png'),

    // Profile pictures
    profile_pic1: getImageKitUrl('assets/profile_pic1.jpg'),
    profile_pic2: getImageKitUrl('assets/profile_pic2.jpg'),
    profile_pic3: getImageKitUrl('assets/profile_pic3.jpg'),
};

// Export individual assets for backward compatibility
export const {
    gs_logo,
    happy_store,
    upload_area,
    logo_en,
    logo_ar,
    googleplay,
    appstore,
    gift,
    visa,
    mada,
    masterCard,
    applePay,
    americanExpress,
    tamara,
    tabby,
    hero_model_img,
    hero_product_img1,
    hero_product_img2,
    product_img1,
    product_img2,
    product_img3,
    product_img4,
    product_img5,
    product_img6,
    product_img7,
    product_img8,
    product_img9,
    product_img10,
    product_img11,
    product_img12,
    profile_pic1,
    profile_pic2,
    profile_pic3,
} = imagekitAssets;