-- Concurrency Defense: Prevent more than one active refund per order
-- Allows re-applying after a refund is marked 'Rejected'
CREATE UNIQUE INDEX unique_open_refund_per_order 
ON refunds (order_id) 
WHERE status IN ('Requested', 'Approved');
