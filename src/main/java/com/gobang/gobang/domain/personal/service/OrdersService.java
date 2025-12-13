package com.gobang.gobang.domain.personal.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.image.repository.ImageRepository;
import com.gobang.gobang.domain.personal.dto.CartOrderItemDto;
import com.gobang.gobang.domain.personal.dto.response.OrdersResponse;
import com.gobang.gobang.domain.personal.dto.response.PrepareOrderResponse;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.entity.UserAddress;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import com.gobang.gobang.domain.personal.repository.UserAddressRepository;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrdersService {

    private final OrdersRepository ordersRepository;
    private final UserAddressRepository userAddressRepository;
    private final ProductRepository productRepository;
    private final ImageRepository imageRepository;

    public List<OrdersResponse> getOrdersByUser(SiteUser user) {
        return ordersRepository.findValidOrders(user)
                .stream()
                .distinct()
                .map(o -> OrdersResponse.from(o, imageRepository))
                .toList();
    }

    public OrdersResponse getOrderDetail(Long orderId, SiteUser user) {
        Orders order = ordersRepository.findByOrderIdAndSiteUser(orderId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        return OrdersResponse.from(order, imageRepository);
    }

    @Transactional
    public void deleteOrder(Long orderId, SiteUser user) {
        Orders order = ordersRepository.findByOrderIdAndSiteUser(orderId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        ordersRepository.delete(order);
    }

    @Transactional
    public OrdersResponse cancelOrder(Long orderId, SiteUser user, String reason) {
        Orders order = ordersRepository.findByIdAndSiteUserWithDeliveries(orderId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        order.cancel(reason);
        return OrdersResponse.from(order, imageRepository);
    }

    @Transactional
    public OrdersResponse returnOrder(Long orderId, SiteUser user, String reason) {
        Orders order = ordersRepository.findByIdAndSiteUserWithDeliveries(orderId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        order.returnOrder(reason);
        return OrdersResponse.from(order, imageRepository);
    }

    @Transactional
    public OrdersResponse exchangeOrder(Long orderId, SiteUser user, String reason) {
        Orders order = ordersRepository.findByIdAndSiteUserWithDeliveries(orderId, user)
                .orElseThrow(() -> new IllegalArgumentException("권한 없음"));

        order.exchange(reason);
        return OrdersResponse.from(order, imageRepository);
    }

    public List<OrdersResponse> getInfiniteOrders(SiteUser user, Long lastOrderId, int size) {
        Pageable pageable = PageRequest.of(0, size);

        return ordersRepository.findInfiniteOrders(user.getId(), lastOrderId, pageable)
                .stream()
                .map(o -> OrdersResponse.from(o, imageRepository))
                .toList();
    }

    @Transactional
    public PrepareOrderResponse prepareCartOrder(
            SiteUser user,
            List<CartOrderItemDto> items,
            Long addressId
    ) {
        UserAddress address = userAddressRepository
                .findByUserAddressIdAndSiteUser_Id(addressId, user.getId())
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        Orders order = Orders.createTempOrder(user);

        BigDecimal total = BigDecimal.ZERO;

        for (CartOrderItemDto item : items) {
            Product product = productRepository.findById(item.getProductId())
                    .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

            BigDecimal price = BigDecimal.valueOf(product.getBasePrice());
            total = total.add(price.multiply(BigDecimal.valueOf(item.getQuantity())));

            order.addOrderItem(product, item.getQuantity(), price);
        }

        order.addDelivery(address);
        order.setTotalPrice(total);
        order.setOrderCode("ORD_" + UUID.randomUUID());

        ordersRepository.save(order);
        return new PrepareOrderResponse(order.getOrderCode(), total.longValueExact());
    }

    @Transactional
    public void cancelBeforePayment(SiteUser user, String orderCode) {
        Orders order = ordersRepository.findByOrderCodeAndSiteUser(orderCode, user)
                .orElseThrow(() -> new IllegalArgumentException("요청을 처리할 수 없습니다."));

        ordersRepository.delete(order);
    }

    // 셀러용 받은 주문 조회 - 상진
    @Transactional(readOnly = true)
    public List<OrdersResponse> getReceivedOrdersByStudio(Long studioId) {
        List<Orders> orders = ordersRepository.findReceivedOrdersByStudioId(studioId);

        return orders.stream()
                .map(order -> OrdersResponse.from(order, imageRepository))
                .toList();
    }
}