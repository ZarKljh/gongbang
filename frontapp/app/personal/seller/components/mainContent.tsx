import OrdersTab from './tabs/OrdersTab'
import CartTab from './tabs/CartTab'
import ProfileTab from './tabs/ProfileTab'
import AddressesTab from './tabs/AddressesTab'
import PaymentTab from './tabs/PaymentTab'
import LikeTab from './tabs/LikeTab'
import ReviewsTab from './tabs/ReviewsTab'
import QnaTab from './tabs/QnaTab'
import StudioTab from './tabs/studioTab'

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
}

export default function MainContent(props: MainContentProps) {
    const { activeTab, userData, stats, studioList, studio } = props

    return (
        <div className="main-content">
            <div className="content-wrapper">
                <div className="stats-table">
                    <table>
                        <thead>
                            <tr>
                                <th>프로필</th>
                                <th>문의</th>
                                <th>상품 리뷰</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>
                                    <div className="profile-image"></div>
                                </td>
                                <td>{stats.totalQna}</td>
                                <td>{stats.totalReviews}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                {activeTab === 'studio' && <StudioTab {...props} />}
                {activeTab === 'orders' && <OrdersTab {...props} />}
                {activeTab === 'cart' && <CartTab {...props} />}
                {activeTab === 'profile' && <ProfileTab {...props} />}
                {activeTab === 'addresses' && <AddressesTab {...props} />}
                {activeTab === 'payment' && <PaymentTab {...props} />}
                {activeTab === 'like' && <LikeTab {...props} />}
                {activeTab === 'reviews' && <ReviewsTab {...props} />}
                {activeTab === 'qna' && <QnaTab {...props} />}
            </div>
        </div>
    )
}
