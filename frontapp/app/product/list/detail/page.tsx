export const dynamic = 'force-dynamic'

import ProductDetailView from '@/app/components/product/detail/ProductDetailView'
import Review from '@/app/components/product/detail/Review'

export default function Page() {
    return (
        <>
            <ProductDetailView />
            <Review />
        </>
    )
}
