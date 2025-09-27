import React from 'react'
import Title from './Title'

const Newsletter = ({ dict, lang }) => {
    const isRTL = lang === 'ar';

    return (
        <div className='flex flex-col items-center mx-4 my-36'>
            <Title title={dict?.newsletter?.title || "Join Newsletter"} description={dict?.newsletter?.description || "Subscribe to get exclusive deals, new arrivals, and insider updates delivered straight to your inbox every week."} visibleButton={false} />
            <div className='flex bg-slate-100 text-sm p-1 rounded-full w-full max-w-xl my-10 border-2 border-white ring ring-slate-200'>
                <input
                    className={`flex-1 outline-none bg-transparent ${isRTL ? 'pr-5 pl-2' : 'pl-5 pr-2'}`}
                    type="text"
                    placeholder={dict?.newsletter?.placeholder || 'Enter your email address'}
                    dir={isRTL ? 'rtl' : 'ltr'}
                />
                <button className='font-medium bg-green-500 text-white px-7 py-3 rounded-full hover:scale-103 active:scale-95 transition'>{dict?.newsletter?.button || 'Get Updates'}</button>
            </div>
        </div>
    )
}

export default Newsletter