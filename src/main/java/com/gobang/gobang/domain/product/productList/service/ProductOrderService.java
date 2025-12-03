package com.gobang.gobang.domain.product.productList.service;

import com.gobang.gobang.domain.auth.entity.SiteUser;
import com.gobang.gobang.domain.auth.repository.SiteUserRepository;
import com.gobang.gobang.domain.personal.entity.Delivery;
import com.gobang.gobang.domain.personal.entity.OrderItem;
import com.gobang.gobang.domain.personal.entity.Orders;
import com.gobang.gobang.domain.personal.entity.UserAddress;
import com.gobang.gobang.domain.personal.repository.DeliveryRepository;
import com.gobang.gobang.domain.personal.repository.OrdersRepository;
import com.gobang.gobang.domain.personal.repository.UserAddressRepository;
import com.gobang.gobang.domain.product.dto.request.PrepareOrderRequest;
import com.gobang.gobang.domain.product.dto.response.ConfirmOrderResponse;
import com.gobang.gobang.domain.product.dto.response.PrepareOrderResponse;
import com.gobang.gobang.domain.product.entity.Product;
import com.gobang.gobang.domain.product.productList.repository.ProductRepository;
import com.gobang.gobang.global.exception.CustomException;
import com.gobang.gobang.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class ProductOrderService {
    private final OrdersRepository ordersRepository;
    private final ProductRepository productRepository;
    private final SiteUserRepository siteUserRepository;
    private final DeliveryRepository deliveryRepository;
    private final UserAddressRepository userAddressRepository;

    //@Value("${custom.payment.secret-key}")
    private String secretKey = "test_sk_docs_3j6nNJE6A6EQ5vPBQ2Xr3e9b";
    /**
     * 임시 주문 생성 (PENDING 상태)
     * - 프론트에서 Toss 결제 호출 전에 호출
     */
    public PrepareOrderResponse prepareOrder(Long userId, PrepareOrderRequest request) {

        // 0. quantity 기본값 처리 (null 방지)
        long quantity = request.getQuantity() != null ? request.getQuantity() : 1L;

        // 1. 유저 조회
        SiteUser user = siteUserRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("회원 정보를 찾을 수 없습니다."));

        // 2. 상품 조회
        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new IllegalArgumentException("상품 정보를 찾을 수 없습니다."));

        // 3. 총 금액 계산 (basePrice: Integer → BigDecimal 변환 + quantity 곱)
        //    totalPrice = basePrice * quantity
        BigDecimal unitPrice = BigDecimal.valueOf(product.getBasePrice()); // Integer → BigDecimal
        BigDecimal totalPrice =
                unitPrice.multiply(BigDecimal.valueOf(quantity)); // Long → BigDecimal

        // 4. Toss 와 주고받을 주문코드 생성
        String orderCode = "ORD-" + UUID.randomUUID();

        // 5. Orders 엔티티 생성
        Orders orders = new Orders();
        orders.setSiteUser(user);
        orders.setOrderCode(orderCode);
        orders.setTotalPrice(totalPrice);
        orders.setStatus("PENDING");
        // createdDate는 @CreationTimestamp로 자동 설정

        // 6. OrderItem 생성 후 Orders에 연결
        OrderItem orderItem = OrderItem.builder()
                .order(orders)
                .product(product)
                .quantity(quantity)
                .price(unitPrice) // 단가 저장 (basePrice)
                .build();

        orders.getOrderItems().add(orderItem);

        // 7. 저장
        ordersRepository.save(orders);

        // 8. 프론트/토스로 넘길 값 반환
        return new PrepareOrderResponse(orderCode, totalPrice);
    }






    @Transactional
    public ConfirmOrderResponse confirmPayment(String orderId, String paymentKey, Long amount) throws Exception {

        // 1) Toss confirm 먼저
//        String auth = secretKey + ":"; // ✅ 콜론 붙이기
//        Base64.Encoder encoder = Base64.getEncoder();
//        String encodedAuth = "Basic " + encoder.encodeToString(auth.getBytes(StandardCharsets.UTF_8));
//
//        URL url = new URL("https://api.tosspayments.com/v1/payments/confirm");
//        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
//        connection.setRequestMethod("POST");
//        connection.setRequestProperty("Authorization", encodedAuth);
//        connection.setRequestProperty("Content-Type", "application/json");
//        connection.setDoOutput(true);
//
//        String jsonBody = String.format(
//                "{\"paymentKey\":\"%s\",\"orderId\":\"%s\",\"amount\":%d}",
//                paymentKey, orderId, amount
//        );
//
//        try (OutputStream os = connection.getOutputStream()) {
//            os.write(jsonBody.getBytes(StandardCharsets.UTF_8));
//            os.flush();
//        }
//
//        int responseCode = connection.getResponseCode();
//        InputStream is = (responseCode == 200)
//                ? connection.getInputStream()
//                : connection.getErrorStream();
//
//        String jsonResponse = new String(is.readAllBytes(), StandardCharsets.UTF_8);
//        System.out.println("📦 Toss 응답: " + jsonResponse);
//
//        ObjectMapper objectMapper = new ObjectMapper();
//        JsonNode root = objectMapper.readTree(jsonResponse);
//
//        if (responseCode != 200) {
//            String errorCode = root.path("code").asText("UNKNOWN");
//            String message = root.path("message").asText("알 수 없는 오류");
//            throw new IllegalStateException("Toss 결제 승인 실패 [" + errorCode + "] " + message);
//        }
//
//        String status = root.path("status").asText(null);
//        if (!"DONE".equals(status)) {
//            throw new IllegalStateException("결제 상태가 DONE 이 아님: " + status);
//        }
//
//        int approvedAmount = root.path("totalAmount").asInt(-1);
//        if (approvedAmount == -1) {
//            approvedAmount = root.path("approvedAmount").asInt(-1);
//        }
//        if (approvedAmount == -1) {
//            throw new IllegalStateException("응답에 금액 정보가 없습니다.");
//        }
//
//        if (!approvedAmountEquals(approvedAmount, amount)) {
//            throw new IllegalStateException("금액 불일치: 요청=" + amount + ", 승인=" + approvedAmount);
//        }
//
//
//
//        System.out.println("✅ 결제 승인 & 주문 업데이트 성공: orderId=" + orderId);
        // 2) Toss 검증 끝났으니 이제 주문 상태 변경
        System.out.println(orderId);

        Orders order = findByOrderCode(orderId);
        markPaid(order, paymentKey, "CARD");



        if (order.getStatus().equals("paid")) { // 혹은 order.getStatus() == OrderStatus.PAID
            // 중복 승인 요청 들어온 상황
            throw new IllegalStateException("이미 결제가 완료된 주문입니다. orderId=" + orderId);
        }

        BigDecimal orderPrice = order.getTotalPrice();      // ex) 76000.00
        BigDecimal requestPrice = BigDecimal.valueOf(amount); // ex) 76000

        // scale 무시하고 순수 금액 비교
        if (orderPrice.compareTo(requestPrice) != 0) {
            throw new IllegalStateException(
                    "금액 불일치: 주문=" + orderPrice + ", 요청=" + requestPrice
            );
        }


        for (OrderItem item : order.getOrderItems()) {
            Product p = item.getProduct();
            p.decreaseStock(item.getQuantity().intValue());
            p.increaseSalesCount(item.getQuantity());
        }


        // 4) ⭐ 회원의 기본배송지 조회
        SiteUser user = order.getSiteUser(); // Orders 엔티티에 @ManyToOne SiteUser 있다고 가정

        UserAddress defaultAddress = userAddressRepository
                .findBySiteUserAndIsDefaultTrue(user)
                .orElseThrow(() -> new CustomException(ErrorCode.NO_DEFAULT_ADDRESS));

        // 5) ⭐ Delivery 생성 (기본배송지로)
        Delivery delivery = Delivery.builder()
                .order(order)
                .address(defaultAddress)
                .deliveryStatus("배송준비중")
                .trackingNumber(null)  // 아직 없음
                .build();

        deliveryRepository.save(delivery);


        return null;
    }


    // Integer 비교용 작은 헬퍼
    private boolean approvedAmountEquals(int approvedAmount, Integer amount) {
        return amount != null && approvedAmount == amount.intValue();
    }

    // 주문코드로 조회
    @Transactional(readOnly = true)
    public Orders findByOrderCode(String orderCode) {
        return ordersRepository.findByOrderCode(orderCode)
                .orElseThrow(() -> new IllegalArgumentException("주문을 찾을 수 없습니다."));
    }

    // 2️⃣ 결제 완료 처리
    public void markPaid(Orders order, String paymentKey, String methodName) {
        order.setStatus("PAID");
        order.setPaymentKey(paymentKey);
        order.setPaymentMethodName(methodName);
        order.setPaidAt(LocalDateTime.now());
    }

}
