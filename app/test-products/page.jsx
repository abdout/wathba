'use client';

import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchProducts } from '@/lib/features/product/productSlice';

// Prevent static generation
export const dynamic = 'force-dynamic';

export default function TestProducts() {
    const dispatch = useDispatch();
    const products = useSelector(state => state?.product?.list || []);
    const loading = useSelector(state => state?.product?.loading);
    const error = useSelector(state => state?.product?.error);
    const reduxState = useSelector(state => state);
    const [apiData, setApiData] = useState(null);
    const [apiError, setApiError] = useState(null);

    // Direct API test
    useEffect(() => {
        console.log('=== TEST PAGE: Direct API Call ===');
        fetch('/api/products?limit=50')
            .then(res => res.json())
            .then(data => {
                console.log('[TestPage] API Response:', data);
                setApiData(data);
            })
            .catch(err => {
                console.error('[TestPage] API Error:', err);
                setApiError(err.message);
            });
    }, []);

    // Redux test
    useEffect(() => {
        console.log('=== TEST PAGE: Redux Dispatch ===');
        dispatch(fetchProducts({ limit: 50 }))
            .then(result => {
                console.log('[TestPage] Redux Action Result:', result);
            })
            .catch(err => {
                console.error('[TestPage] Redux Error:', err);
            });
    }, [dispatch]);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace' }}>
            <h1>Product Loading Test Page</h1>

            <div style={{ marginTop: '20px' }}>
                <h2>Direct API Test</h2>
                <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
                    {apiError && <div style={{ color: 'red' }}>Error: {apiError}</div>}
                    {apiData && (
                        <div>
                            <p>Success: {apiData.success ? 'YES' : 'NO'}</p>
                            <p>Products Count: {apiData.data?.products?.length || 0}</p>
                            <p>First Product: {apiData.data?.products?.[0]?.name || 'None'}</p>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h2>Redux State</h2>
                <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px' }}>
                    <p>Loading: {loading ? 'YES' : 'NO'}</p>
                    <p>Error: {error || 'None'}</p>
                    <p>Products Count: {products.length}</p>
                    <p>First Product: {products[0]?.name || 'None'}</p>
                </div>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h2>Full Redux State</h2>
                <pre style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', overflow: 'auto' }}>
                    {JSON.stringify(reduxState, null, 2)}
                </pre>
            </div>

            <div style={{ marginTop: '20px' }}>
                <h2>Products List</h2>
                <div style={{ background: '#f0f0f0', padding: '10px', borderRadius: '5px', maxHeight: '300px', overflow: 'auto' }}>
                    {products.map((product, index) => (
                        <div key={product.id || index} style={{ borderBottom: '1px solid #ddd', padding: '5px' }}>
                            {index + 1}. {product.name} - ${product.price}
                        </div>
                    ))}
                    {products.length === 0 && <div>No products in Redux store</div>}
                </div>
            </div>
        </div>
    );
}