// Mock CMS page data for testing blocks
export const mockHomePage = {
  id: "mock-home-page",
  title: "Home Page",
  slug: "home",
  blocks: [
    // Hero Overlapping Block
    {
      blockType: "hero-overlapping",
      id: "hero-1",
      title: "Start a Charity Fundraiser on onlydonations",
      description:
        "Make a difference for your favorite nonprofit by starting a onlydonations for your birthday, a marathon, or just because you care.",
      ctaText: "Start a onlydonations",
      ctaLink: "/start",
      imageUrl:
        "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=2070&auto=format&fit=crop",
      imageAlt: "Volunteers serving food",
      backgroundColor: "beige",
    },

    // How It Works Block
    {
      blockType: "how-it-works",
      id: "how-it-works-1",
      title: "How to start a onlydonations",
      ctaText: "Start a onlydonations",
      ctaLink: "/start",
    },

    // Icon Cards Block (Tips)
    {
      blockType: "icon-cards",
      id: "icon-cards-1",
      title: "Tips for your charity fundraiser on onlydonations",
      moreButtonText: "More Tips",
      moreButtonLink: "/tips",
      items: [
        {
          id: "tip-1",
          iconName: "quote",
          title: 'Share your "why"',
          description:
            "In your fundraising description, share why you are fundraising for the charity. Researching the charity's website for a quick mission statement or to explain how they live out their cause is also helpful for potential donors.",
        },
        {
          id: "tip-2",
          iconName: "calendar",
          title: "Use events or moments",
          description:
            "One way to help drive donations is to tie your cause back to a timely moment or event. Whether it's breast cancer awareness month, an upcoming marathon, a birthday, or a random Tuesday that you want to make special, share the date so people can get excited.",
        },
        {
          id: "tip-3",
          iconName: "heart",
          title: "Thank and update donors",
          description:
            "Easily keep donors updated about the campaign's progress and thank them for their support. Simple gestures like personalized thank you notes with an ask for additional help in sharing your cause with their networks is easy but powerful.",
        },
        {
          id: "tip-4",
          iconName: "share",
          title: "Spread the word",
          description:
            "Share your fundraiser across social media platforms and encourage friends and family to do the same. The more people who see your campaign, the more likely you are to reach your goal and make a meaningful impact.",
        },
      ],
    },

    // Fundraiser Examples Block
    {
      blockType: "fundraiser-examples",
      id: "fundraiser-examples-1",
      title: "Examples of charity fundraisers on onlydonations",
      ctaText: "Start a Fundraiser",
      ctaLink: "/start",
      campaignIds: [
        { id: "camp-1", campaignId: "campaign-123" },
        { id: "camp-2", campaignId: "campaign-456" },
        { id: "camp-3", campaignId: "campaign-789" },
      ],
    },

    // FAQ Block (using existing FAQ block)
    {
      blockType: "faq",
      id: "faq-1",
      title: "Questions about charity fundraising on onlydonations",
      displayStyle: "accordion",
      faqs: [
        {
          id: "faq-1",
          question: "How does the charity receive the money I raise?",
          answer: [
            {
              type: "paragraph",
              children: [
                {
                  text: "Funds raised on a charity fundraiser through onlydonations will be processed through our payment partner, PayPal Giving Fund, who will deliver the funds directly to the charity on your behalf. As the fundraiser organizer, you do not need to do anything to transfer funds to the charity!",
                },
              ],
            },
          ],
        },
        {
          id: "faq-2",
          question: "What details should I include in a charity fundraiser?",
          answer: [
            {
              type: "paragraph",
              children: [
                {
                  text: "Include the charity's name, your fundraising goal, why you're raising funds, and how the money will be used. Adding photos and regular updates can help engage potential donors and build trust in your campaign.",
                },
              ],
            },
          ],
        },
        {
          id: "faq-3",
          question: "Can I raise my goal if the financial needs increase?",
          answer: [
            {
              type: "paragraph",
              children: [
                {
                  text: "Yes, you can adjust your fundraising goal at any time. Simply go to your fundraiser dashboard and update the goal amount. This flexibility allows you to respond to changing needs while keeping your donors informed.",
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  published: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};
