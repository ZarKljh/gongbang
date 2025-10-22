package com.gobang.gobang.domain.personal.dto;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.entity.Studio;
import com.gobang.gobang.domain.personal.entity.*;
import com.gobang.gobang.domain.product.entity.Product;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
public class MyPageDTO {
    private final Long cartId;
    private final SiteUser cartUser;
    private final Product cartProduct;
    private final Long cartQuantity;
    private final LocalDateTime cartCreatedAt;

    private final Long deliveryId;
    private final Orders deliveryOrder;
    private final UserAddress deliveryAddress;
    private final String deliveryTrackingNumber;
    private final String deliveryDeliveryStatus;
    private final LocalDateTime deliveryCompletedAt;
    private final LocalDateTime deliveryCreatedDate;
    private final LocalDateTime deliveryModifiedDate;

    private final Long followId;
    private final SiteUser followUser;
    private final Studio followStudio;
    private final LocalDateTime followCreatedAt;

    private final Long orderItemId;
    private final Orders orderItemOrder;
    private final Product orderItemProduct;
    private final Long orderItemQuantity;
    private final BigDecimal orderItemPrice;

    private final Long orderId;
    private final SiteUser orderUser;
    private final String orderCord;
    private final BigDecimal orderTotalPrice;
    private final Delivery orderDelivery;

    private final Long paymentMethodId;
    private final SiteUser paymentMethodUser;
    private final String paymentMethodType;
    private final String paymentMethodBankName;
    private final String paymentMethodAccountNumber;
    private final String paymentMethodCardCompany;
    private final String paymentMethodCardNumber;
    private final Boolean paymentMethodDefaultPayment;
    private final LocalDateTime paymentMethodCreatedAt;
    private final LocalDateTime paymentMethodModifiedDate;

    private final Long userAddressId;
    private final SiteUser userAddressUser;
    private final String userAddressRecipientName;
    private final String userAddressBaseAddress;
    private final String userAddressDetailAddress;
    private final String userAddressZipcode;
    private final Boolean userAddressIsDefault;
    private final LocalDateTime userAddressCreatedAt;
    private final LocalDateTime userAddressUpdatedAt;

    private final Long wishlistId;
    private final SiteUser wishlistUser;
    private final Product wishlistProduct;
    private final LocalDateTime wishlistCreatedAt;

    public MyPageDTO(Cart cart, Delivery delivery, Follow follow, OrderItem orderItem, Orders orders, PaymentMethod paymentMethod, UserAddress userAddress, WishList wishList) {
        this.cartId = cart.getCartId();
        this.cartUser = cart.getSiteUser();
        this.cartProduct = cart.getProduct();
        this.cartQuantity = cart.getQuantity();
        this.cartCreatedAt = cart.getCreatedAt();

        this.deliveryId = delivery.getDeliveryId();
        this.deliveryOrder = delivery.getOrder();
        this.deliveryAddress = delivery.getAddress();
        this.deliveryTrackingNumber = delivery.getTrackingNumber();
        this.deliveryDeliveryStatus = delivery.getDeliveryStatus();
        this.deliveryCompletedAt = delivery.getCompletedAt();
        this.deliveryCreatedDate = delivery.getCreatedDate();
        this.deliveryModifiedDate = delivery.getModifiedDate();

        this.followId = follow.getFollowId();
        this.followUser = follow.getSiteUser();
        this.followStudio = follow.getStudio();
        this.followCreatedAt = follow.getCreatedAt();

        this.orderItemId = orderItem.getOrderItemId();
        this.orderItemOrder = orderItem.getOrder();
        this.orderItemProduct = orderItem.getProduct();
        this.orderItemQuantity = orderItem.getQuantity();
        this.orderItemPrice = orderItem.getPrice();

        this.orderId = orders.getOrderId();
        this.orderUser = orders.getSiteUser();
        this.orderCord = orders.getOrderCord();
        this.orderTotalPrice = orders.getTotalPrice();
        this.orderDelivery = orders.getDelivery();

        this.paymentMethodId = paymentMethod.getPaymentId();
        this.paymentMethodUser = paymentMethod.getSiteUser();
        this.paymentMethodType = paymentMethod.getType();
        this.paymentMethodBankName = paymentMethod.getBankName();
        this.paymentMethodAccountNumber = paymentMethod.getAccountNumber();
        this.paymentMethodCardCompany = paymentMethod.getCardCompany();
        this.paymentMethodCardNumber = paymentMethod.getCardNumber();
        this.paymentMethodDefaultPayment = paymentMethod.getDefaultPayment();
        this.paymentMethodCreatedAt = paymentMethod.getCreatedAt();
        this.paymentMethodModifiedDate = paymentMethod.getModifiedDate();

        this.userAddressId = userAddress.getUserAddressId();
        this.userAddressUser = userAddress.getSiteUser();
        this.userAddressRecipientName = userAddress.getRecipientName();
        this.userAddressBaseAddress = userAddress.getBaseAddress();
        this.userAddressDetailAddress = userAddress.getDetailAddress();
        this.userAddressZipcode = userAddress.getZipcode();
        this.userAddressIsDefault = userAddress.getIsDefault();
        this.userAddressCreatedAt = userAddress.getCreatedAt();
        this.userAddressUpdatedAt = userAddress.getUpdatedAt();

        this.wishlistId = wishList.getWishlistId();
        this.wishlistUser = wishList.getSiteUser();
        this.wishlistProduct = wishList.getProduct();
        this.wishlistCreatedAt = wishList.getCreatedAt();
    }
}
