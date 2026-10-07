from sentence_transformers import SentenceTransformer, util


faq_text = """
What investment product does PIFC offer?
We currently offer PIFC Investment Notes, a fixed-term investment that pays a competitive yield on your principal. Rates are reviewed periodically in line with prevailing market conditions.

What is the minimum amount I can invest?
You can start investing with as little as ₦50,000. There is no upper limit — the more you invest, the more you earn.

What is the minimum tenor?
Our Investment Notes run from 30 days up to 12 months. Longer tenors typically attract higher rates.

If I have urgent cash needs, can I liquidate and get my funds?
Yes, early liquidation is possible in genuine emergencies, though a reduced rate may apply for the unexpired period. Contact us to discuss your options.

How can I get my interest?
Interest is paid directly into your linked PIFC account, either at maturity or at agreed intervals depending on the plan you choose.

Can I get my interest upfront?
Upfront interest payment is available on select plans. Ask your relationship officer whether your chosen tenor qualifies.

Are there any associated charges?
There are no hidden fees on our Investment Notes. Any applicable charges, such as early-liquidation adjustments, are disclosed clearly before you commit.

How do I make a payment or transfer from my account?
You can transfer funds through internet banking, our mobile app, USSD, or by visiting any branch. All digital channels are available 24/7.


Which payment channels do you support?
We support bank transfers, card payments, and USSD. Direct debit mandates (DDM) are also available for recurring loan repayments.


Is there a limit on how much I can transfer in a day?
Daily transfer limits depend on your account tier and verification level. Contact us or check your online banking settings for your current limit.
"""

question_answer_list = faq_text.split('\n\n')

chunk_list = []
chunk_list_to_embedd = []

for match in question_answer_list:
    pair = match.strip().split('\n')
    chunk_list.append({
        "question" : pair[0],
        "answer" : pair[1]
    })
    chunk_list_to_embedd.append(pair[0] + "\n" + pair[1])


model = SentenceTransformer('all-MiniLM-L6-v2')

chunk_embeddings = model.encode(chunk_list_to_embedd)

test_strings = "Can I cash out my investment before it matures?,What is DDM?,Do you offer mortgages?"

def get_top_3(user_query) :
    query_embedding = model.encode(user_query)
    scores = util.cos_sim(query_embedding, chunk_embeddings)

    converted_scores = scores[0].tolist()
    pairs = list(zip(chunk_list, converted_scores))

    return sorted(pairs, key=lambda x: x[1], reverse=True)[:3]

for query in test_strings.split(',') :
    top_3 = get_top_3(query)
    print(f"\n\nQuery: {query}")
    for chunk, score in top_3:
        print(f"{score:.3f} \n{chunk['question']}\n{chunk['answer']}")
