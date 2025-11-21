interface ExampleWorkflowParmas {
  dataToPassIn;
}

interface Env extends Cloudflare.Env {
  PAYSTACK_SECRET_KEY: string;
}
