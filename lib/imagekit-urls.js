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
    polygon: getImageKitUrl('assets/polygon.png'),

    // Currency icon
    dirham: getImageKitUrl('assets/dirham.svg'),

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

    // Product images (moved to product folder)
    product_img1: getImageKitUrl('assets/product/product_img1.png'),
    product_img2: getImageKitUrl('assets/product/product_img2.png'),
    product_img3: getImageKitUrl('assets/product/product_img3.png'),
    product_img4: getImageKitUrl('assets/product/product_img4.png'),
    product_img5: getImageKitUrl('assets/product/product_img5.png'),
    product_img6: getImageKitUrl('assets/product/product_img6.png'),
    product_img7: getImageKitUrl('assets/product/product_img7.png'),
    product_img8: getImageKitUrl('assets/product/product_img8.png'),
    product_img9: getImageKitUrl('assets/product/product_img9.png'),
    product_img10: getImageKitUrl('assets/product/product_img10.png'),
    product_img11: getImageKitUrl('assets/product/product_img11.png'),
    product_img12: getImageKitUrl('assets/product/product_img12.png'),
    product_img13: getImageKitUrl('assets/product/product_img13.png'),
    product_img14: getImageKitUrl('assets/product/product_img14.png'),
    product_img15: getImageKitUrl('assets/product/product_img15.png'),
    product_img16: getImageKitUrl('assets/product/product_img16.png'),

    // New product images
    fine_1: getImageKitUrl('assets/product/fine-1.avif'),
    fine_2: getImageKitUrl('assets/product/fine-2.avif'),
    fine_3: getImageKitUrl('assets/product/fine-3.avif'),
    fine_4: getImageKitUrl('assets/product/fine-4.avif'),
    halabi_1: getImageKitUrl('assets/product/halabi-1.avif'),
    halabi_2: getImageKitUrl('assets/product/halabi-2.avif'),
    halabi_3: getImageKitUrl('assets/product/halabi-3.avif'),
    lays_1: getImageKitUrl('assets/product/lays-1.avif'),
    lays_2: getImageKitUrl('assets/product/lays-2.avif'),
    nido_1: getImageKitUrl('assets/product/nido-1.avif'),
    nido_2: getImageKitUrl('assets/product/nido-2.avif'),
    nido_3: getImageKitUrl('assets/product/nido-3.avif'),
    omo_1: getImageKitUrl('assets/product/omo-1.avif'),
    omo_2: getImageKitUrl('assets/product/omo-2.avif'),
    pampers_1: getImageKitUrl('assets/product/pampers-1.avif'),
    pampers_2: getImageKitUrl('assets/product/pampers-2.avif'),
    pampers_3: getImageKitUrl('assets/product/pampers-3.avif'),
    pampers_4: getImageKitUrl('assets/product/pampers-4.avif'),
    persil_1: getImageKitUrl('assets/product/persil-1.avif'),
    persil_2: getImageKitUrl('assets/product/persil-2.avif'),
    persil_3: getImageKitUrl('assets/product/persil-3.avif'),
    tide_1: getImageKitUrl('assets/product/tide-1.avif'),
    tide_2: getImageKitUrl('assets/product/tide-2.avif'),
    tide_3: getImageKitUrl('assets/product/tide-3.avif'),

    // Profile pictures
    profile_pic1: getImageKitUrl('assets/profile_pic1.jpg'),
    profile_pic2: getImageKitUrl('assets/profile_pic2.jpg'),
    profile_pic3: getImageKitUrl('assets/profile_pic3.jpg'),

    // About page images
    who: getImageKitUrl('assets/who.jpg'),
    why: getImageKitUrl('assets/why.jpg'),
};

// Export individual assets for backward compatibility
export const {
    gs_logo,
    happy_store,
    upload_area,
    logo_en,
    logo_ar,
    dirham,
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
    product_img13,
    product_img14,
    product_img15,
    product_img16,
    fine_1,
    fine_2,
    fine_3,
    fine_4,
    halabi_1,
    halabi_2,
    halabi_3,
    lays_1,
    lays_2,
    nido_1,
    nido_2,
    nido_3,
    omo_1,
    omo_2,
    pampers_1,
    pampers_2,
    pampers_3,
    pampers_4,
    persil_1,
    persil_2,
    persil_3,
    tide_1,
    tide_2,
    tide_3,
    profile_pic1,
    profile_pic2,
    profile_pic3,
    who,
    why,
} = imagekitAssets;