namespace Entity
{
    public class StripePayment
    {
        public string PaymentIntentId { get; set; }
        public string ClientSecret { get; set; }
        public string UserId { get; set; }
        public decimal Amount { get; set; }
        public string Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public virtual ICollection<Order> Orders { get; set; }
    }
}
