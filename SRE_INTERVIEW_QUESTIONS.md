# SRE Interview Questions - Terraform & Infrastructure

## **CRITICAL CONCEPTS TO KNOW**

### **1. Terraform State Management**
**Q: What is Terraform state and why is it critical?**
- State file tracks real-world resources
- Maps config to actual infrastructure
- Stores metadata and resource dependencies
- NEVER manually edit state files
- Use remote backends (S3 + DynamoDB) for team collaboration

**Your Answer:** "In my project, I use Terraform state to track my AWS resources like CloudFront, Lambda, and DynamoDB. The state file ensures Terraform knows what's deployed so it can calculate changes (plan) before applying them. For production, I'd use remote state in S3 with DynamoDB locking to prevent concurrent modifications."

---

### **2. Environment Separation**
**Q: How do you separate dev/staging/production in Terraform?**

**Approaches:**
1. **Workspaces** (Not recommended for prod/dev separation)
2. **Directory-based** (Best practice) ✅
3. **Branch-based** (GitOps approach)

**Your Answer:** "I use directory-based separation with reusable modules. Each environment (dev/staging/prod) has its own directory with separate state files. I create modules for networking, compute, storage, and IAM that can be reused across environments with different variable values. This prevents code duplication and ensures consistency."

**Why separate?**
- Isolate blast radius (break dev, not prod)
- Different resource sizes (smaller dev instances)
- Different access controls
- Independent testing

---

### **3. Terraform Modules**
**Q: What are modules and when would you use them?**

**Your Answer:** "Modules are reusable Terraform configurations. In my resume website project, I created modules for:
- **Networking**: CloudFront distribution + API Gateway
- **Compute**: Lambda functions with configurable runtime/memory
- **Storage**: S3 buckets + DynamoDB tables
- **IAM**: Roles and policies

This lets me deploy the same architecture to dev/staging/prod with different parameters (bucket names, Lambda memory, etc.) without duplicating code."

**Benefits:**
- DRY principle (Don't Repeat Yourself)
- Easier testing and validation
- Standardization across teams
- Version control for infra components

---

### **4. Terraform Workflow**
**Q: Explain the Terraform workflow (init, plan, apply, destroy)**

**Your Answer:**
1. `terraform init`: Downloads providers (AWS), initializes backend (S3 state)
2. `terraform plan`: Shows what will change (preview)
3. `terraform apply`: Creates/modifies resources
4. `terraform destroy`: Removes all managed resources

**In practice:**
- Always run `plan` before `apply`
- Review plan output carefully
- Use `-target` for specific resource updates
- Store plans: `terraform plan -out=plan.tfplan`

---

### **5. CloudFront + S3 + OAC**
**Q: How does CloudFront Origin Access Control work?**

**Your Answer:** "In my project, I use CloudFront OAC to secure my S3 bucket. The bucket is PRIVATE with all public access blocked. CloudFront uses OAC to sign requests with IAM credentials (SigV4), and the S3 bucket policy only allows GetObject from CloudFront's OAC. This prevents direct S3 access—users must go through CloudFront."

**Why OAC over OAI?**
- OAC supports S3 SSE-KMS encryption
- Better security with SigV4 signing
- OAI is legacy (deprecated path)

---

### **6. IAM Best Practices**
**Q: How do you implement least privilege in IAM?**

**Your Answer:** "In my Lambda function, I created a custom IAM role with only the permissions needed:
- `dynamodb:GetItem` and `dynamodb:UpdateItem` on the specific visitor counter table
- `logs:CreateLogGroup/Stream/PutLogEvents` for CloudWatch

I avoid using managed policies like `AdministratorAccess` or wildcards. Each resource has explicit ARNs."

**Key principles:**
- Explicit deny overrides allow
- Use resource-specific ARNs (not `*`)
- Separate roles for each service
- Regularly audit unused permissions

---

### **7. API Gateway Types**
**Q: What's the difference between REST API and HTTP API in API Gateway?**

**Your Answer:** "I use HTTP API (v2) for my visitor counter because:
- Lower cost (70% cheaper)
- Lower latency
- Built-in CORS support
- Simple use case (just GET /count)

REST API is better for:
- API keys and usage plans
- Request/response transformations
- AWS X-Ray tracing"

---

### **8. Lambda Best Practices**
**Q: What are Lambda cold start issues and how do you mitigate them?**

**Your Answer:**
- **Cold start**: First invocation takes longer (load runtime, init code)
- **Mitigations**:
  - Keep deployment package small
  - Use provisioned concurrency (costs more)
  - Choose faster runtimes (Python 3.12 is fast)
  - Minimize dependencies
  - Use Lambda SnapStart (Java only)

"In my project, my Lambda is lightweight (just Python boto3), so cold starts are minimal (<100ms)."

---

### **9. DynamoDB Design**
**Q: Why use DynamoDB for a visitor counter?**

**Your Answer:**
- **Serverless**: No servers to manage
- **Pay-per-request**: Only pay for actual reads/writes
- **Atomic operations**: `UpdateItem` with `ADD` is atomic (no race conditions)
- **Low latency**: Single-digit millisecond response
- **High availability**: Multi-AZ by default

**For a counter:**
```python
dynamodb.update_item(
    Key={'id': 'counter'},
    UpdateExpression='ADD visits :inc',
    ExpressionAttributeValues={':inc': 1}
)
```
This is atomic—handles concurrent requests safely.

---

### **10. Infrastructure as Code Benefits**
**Q: Why use Terraform instead of ClickOps (AWS Console)?**

**Your Answer:**
- **Version control**: Track changes in Git
- **Reproducibility**: Rebuild infra from code
- **Documentation**: Code IS documentation
- **Collaboration**: Team can review via PRs
- **Automation**: Integrate with CI/CD
- **Disaster recovery**: Redeploy in minutes

---

## **SCENARIO-BASED QUESTIONS**

### **Scenario 1: Website Down**
**Q: Your CloudFront distribution returns 403 errors. How do you troubleshoot?**

**Troubleshooting steps:**
1. Check S3 bucket policy—does it allow CloudFront OAC?
2. Check CloudFront origin settings—correct bucket regional domain name?
3. Check S3 public access block—should be enabled (private bucket)
4. Check OAC configuration—correct signing behavior?
5. Check CloudFront distribution status—fully deployed?
6. Check Route 53—DNS pointing to CloudFront?

**Your Answer:** "I'd start by checking CloudWatch Logs for CloudFront. Then verify the S3 bucket policy allows GetObject from my CloudFront OAC ARN. I'd also check if files exist in S3 with correct paths (no leading slashes)."

---

### **Scenario 2: Terraform State Lock**
**Q: `terraform apply` fails with "Error acquiring the state lock". What do you do?**

**Your Answer:**
1. Check if another `terraform apply` is running
2. If process crashed, lock might be stuck
3. Check DynamoDB lock table for stuck locks
4. Verify with team—is someone else applying changes?
5. **Last resort**: `terraform force-unlock <LOCK_ID>` (only if certain no one else is running)

**Prevention:**
- Use remote state with locking (S3 + DynamoDB)
- CI/CD to serialize applies
- Never run concurrent applies

---

### **Scenario 3: Rolling Back Changes**
**Q: You applied a Terraform change that broke production. How do you rollback?**

**Your Answer:**
1. **If using Git**: Revert the commit, run `terraform apply` with old config
2. **If you have the plan file**: Restore previous state from backup
3. **Emergency**: Manually fix in console, then `terraform refresh` and update code
4. **Best practice**: Always keep previous Terraform state backups in S3 versioning

"I'd revert my Git commit to the last known good state, run `terraform plan` to verify the revert, then `terraform apply` to restore the previous configuration."

---

### **Scenario 4: Cost Optimization**
**Q: How would you reduce costs for this architecture?**

**Your Answer:**
- **CloudFront**: Use PriceClass_100 (only US/EU) instead of All
- **Lambda**: Right-size memory (128MB might be enough)
- **DynamoDB**: Use PAY_PER_REQUEST for low traffic (already doing this)
- **S3**: Enable intelligent tiering for infrequent access
- **API Gateway**: HTTP API instead of REST API (already doing this)
- **CloudWatch Logs**: Set retention period (default is forever)

---

## **TERRAFORM-SPECIFIC TECHNICAL QUESTIONS**

### **Q: What's the difference between `count` and `for_each`?**
**Answer:**
- `count`: Creates list of resources (indexed by number)
- `for_each`: Creates map of resources (indexed by key)

**Use `for_each` when:**
- Resources might be added/removed from middle of list
- Need meaningful identifiers
- Example: Creating S3 buckets from a list

```hcl
# count (bad for removals)
resource "aws_s3_bucket" "buckets" {
  count  = length(var.bucket_names)
  bucket = var.bucket_names[count.index]
}

# for_each (better)
resource "aws_s3_bucket" "buckets" {
  for_each = toset(var.bucket_names)
  bucket   = each.value
}
```

---

### **Q: What are data sources in Terraform?**
**Answer:** Data sources query existing resources (not managed by Terraform).

**In my project:**
```hcl
data "aws_route53_zone" "this" {
  name = "denisriungu.de."
}
```
This looks up my existing Route 53 zone so I can create records in it.

---

### **Q: How do you handle secrets in Terraform?**
**Answer:**
- **Never** hardcode secrets in `.tf` files
- Use AWS Secrets Manager or Parameter Store
- Reference via data sources
- Use environment variables for sensitive variables
- Enable `.tfvars` in `.gitignore`

```hcl
data "aws_secretsmanager_secret_version" "api_key" {
  secret_id = "my-api-key"
}

resource "aws_lambda_function" "app" {
  environment {
    variables = {
      API_KEY = data.aws_secretsmanager_secret_version.api_key.secret_string
    }
  }
}
```

---

### **Q: What is terraform refresh and when do you use it?**
**Answer:** Updates Terraform state to match real-world resources without making changes.

**Use when:**
- Resources changed outside Terraform (manual console changes)
- Validating state accuracy
- Before importing resources

**Note:** `terraform plan` and `apply` automatically refresh by default.

---

## **QUESTIONS TO ASK THE INTERVIEWER**

1. "What's your team's approach to infrastructure as code? Do you use Terraform, CloudFormation, or something else?"
2. "How do you handle multi-environment deployments (dev/staging/prod)?"
3. "What's your incident response process when infrastructure issues occur?"
4. "Do you use GitOps for infrastructure deployments?"
5. "What monitoring and observability tools do you use?"
6. "How do you manage Terraform state and prevent conflicts in a team environment?"

---

## **KEY TALKING POINTS ABOUT YOUR PROJECT**

### **Architecture Overview**
"I built a serverless resume website using Terraform with:
- **Frontend**: CloudFront CDN serving S3 static content with custom domain (denisriungu.de)
- **API**: HTTP API Gateway with Lambda for real-time visitor counter
- **Database**: DynamoDB for atomic counter updates
- **Security**: S3 bucket is private with CloudFront OAC, IAM least privilege roles
- **DNS**: Route 53 with ACM SSL certificate (validated via DNS)

The entire infrastructure is defined as code in Terraform with separate modules for networking, compute, storage, and IAM, deployable to multiple environments."

### **Why This Architecture?**
- **Serverless**: No servers to patch or maintain
- **Scalable**: Handles 0 to millions of requests
- **Cost-effective**: Pay only for usage ($1-2/month)
- **Secure**: Private S3, signed requests, HTTPS-only
- **Fast**: CloudFront CDN with edge caching

### **Challenges Solved**
1. **CORS issues**: Configured API Gateway HTTP API with proper CORS headers
2. **S3 security**: Migrated from OAI to OAC for better security
3. **Race conditions**: Used DynamoDB atomic ADD operation for counter
4. **Certificate**: ACM certificate must be in us-east-1 for CloudFront (dual provider setup)

---

## **QUICK WINS TO MENTION**

1. "I use remote state with S3 backend and DynamoDB locking for team collaboration"
2. "I implemented Infrastructure as Code following DRY principles with reusable modules"
3. "I separated environments (dev/staging/prod) to isolate failures and enable safe testing"
4. "I follow AWS Well-Architected Framework pillars: security, reliability, cost optimization"
5. "I use CloudWatch for monitoring and can set up alerts for errors or high costs"

---

## **GOOD LUCK!** 🚀

**Remember:**
- Be honest if you don't know something
- Explain your thought process
- Ask clarifying questions
- Relate answers to your actual project
- Show enthusiasm for learning

**Time management tip:** If you get stuck on a question, say "Let me think through this systematically" and break it down step by step.
