import { MainContentProps } from './types/mainContent.types'
/*
import OrdersTab from './tabs/OrdersTab'
import CartTab from './tabs/CartTab'
import ProfileTab from './tabs/ProfileTab'
import AddressesTab from './tabs/AddressesTab'
import PaymentTab from './tabs/PaymentTab'
import LikeTab from './tabs/LikeTab'
import ReviewsTab from './tabs/ReviewsTab'
import QnaTab from './tabs/QnaTab'
*/
import StudioTab from './tabs/studioTab'
import ProfileTab from './tabs/profileTab'
import StudioAddTab from './tabs/studioAddTab'
import ProductListTab from './tabs/productListTab'
import AddProductTab from './tabs/addProductTab'
import ModifyProductTab from './tabs/modifyProductTab'
import OrderList from '@/app/personal/seller/components/ReceivedOrderList'

/*
interface MainContentProps {
    activeTab: string
    activeSubTab: string
    onSubTabClick: (tab: string) => void
    userData: any
    stats: any
    orders: any[]
    cart: any[]
    myReviews: any[]
    addresses: any[]
    paymentMethods: any[]
    wishList: any[]
    followList: any[]
    qna: any[]
    studioList: any[]
    studio: any

    // profile 관련 (선택적 — 나중에 필요할 경우 사용)
    tempData?: any
    isAuthenticated?: boolean
    editMode?: any
    passwordInput?: string
    newPassword?: string
    confirmPassword?: string
    onVerifyPassword?: () => void
    onEdit?: (section: string) => void
    onSave?: (section: string) => void
    onCancel?: (section: string) => void
    onTempChange?: (field: string, value: string) => void
    onNewPasswordChange?: (val: string) => void
    onConfirmPasswordChange?: (val: string) => void
}
*/

export default function MainContent(props: MainContentProps) {
    //const { activeTab, userData, stats, studioList, studio } = props
    const { activeTab, studio, orders } = props

    return (
        <div className="main-content">
            <div className="content-wrapper">
                <div className="stats-table">
                    <table>
                        <thead>
                            <tr>
                                <th>프로필</th>
                                <th>등록공방수</th>
                                <th>등록상품수</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="profile-image">
                                        {studio?.studioLogoImage?.imageFileName ? (
                                            <img
                                                src={`http://localhost:8090/images/${studio.studioLogoImage.imageFileName}`}
                                                alt="공방로고사진"
                                            />
                                        ) : (
                                            <div className="no-image">default gray gradient circle</div>
                                        )}
                                    </div>
                                </td>
                                <td>{/*stats.totalQna*/}</td>
                                <td>{/*stats.totalReviews*/}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {activeTab === 'studio' && <StudioTab {...props} />}
                {activeTab === 'profile' && <ProfileTab {...props} />}
                {activeTab === 'studioAdd' && <StudioAddTab {...props} />}
                {activeTab === 'productList' && <ProductListTab {...props} />}
                {activeTab === 'productAdd' && <AddProductTab {...props} />}
                {activeTab === 'productModify' && <ModifyProductTab {...props} />}
                {activeTab === 'orderList' && <OrderList orders={orders} />}
            </div>
        </div>
    )
}
/*
                {activeTab === 'studioDesc' && <StudioDescTab {...props} />}
                {activeTab === 'orders' && <OrdersTab {...props} />}
                {activeTab === 'cart' && <CartTab {...props} />}
                {activeTab === 'profile' && <ProfileTab {...props} />}
                {activeTab === 'addresses' && <AddressesTab {...props} />}
                {activeTab === 'payment' && <PaymentTab {...props} />}
                {activeTab === 'like' && <LikeTab {...props} />}
                {activeTab === 'reviews' && <ReviewsTab {...props} />}
                {activeTab === 'qna' && <QnaTab {...props} />}
                <p>{JSON.stringify(studio)}</p>
*/
