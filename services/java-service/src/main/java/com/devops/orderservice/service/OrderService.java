package com.devops.orderservice.service;

import com.devops.orderservice.model.Order;
import com.devops.orderservice.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    @Autowired
    private RestTemplate restTemplate;

    @Value("${node.service.url}")
    private String nodeServiceUrl;

    @Value("${python.service.url}")
    private String pythonServiceUrl;

    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    public Optional<Order> getOrderById(String id) {
        return orderRepository.findById(id);
    }

    @SuppressWarnings("unchecked")
    public Order createOrder(Order order) {
        // Validate user exists via Node.js service
        try {
            ResponseEntity<Map> userResponse = restTemplate.getForEntity(
                    nodeServiceUrl + "/api/users/" + order.getUserId(), Map.class);
        } catch (Exception e) {
            throw new RuntimeException("User not found");
        }

        // Validate product exists via Python service
        Map<String, Object> productData;
        try {
            ResponseEntity<Map> productResponse = restTemplate.getForEntity(
                    pythonServiceUrl + "/api/products/" + order.getProductId(), Map.class);
            productData = productResponse.getBody();
        } catch (Exception e) {
            throw new RuntimeException("Product not found");
        }

        // Extract price and calculate total
        if (productData == null) {
            throw new RuntimeException("Product not found");
        }
        Number price = (Number) productData.get("price");
        if (price == null) {
            throw new RuntimeException("Product not found");
        }
        order.setTotalPrice(price.doubleValue() * order.getQuantity());

        // Set defaults
        order.setStatus("PENDING");
        order.setCreatedAt(new Date());

        return orderRepository.save(order);
    }

    public Optional<Order> updateOrderStatus(String id, String status) {
        Optional<Order> optionalOrder = orderRepository.findById(id);
        if (optionalOrder.isPresent()) {
            Order order = optionalOrder.get();
            order.setStatus(status);
            return Optional.of(orderRepository.save(order));
        }
        return Optional.empty();
    }

    public void deleteOrder(String id) {
        orderRepository.deleteById(id);
    }
}
