import { EEmailType } from '@/enums';

const PROJECT_REGISTERED_TMP = {
  type: EEmailType.PROJECT_REGISTERED,
  subject:
    "Congratulations! You've Successfully Registered for the {{PROJECT_NAME}} IDO Raffle on Kyupad!",
  content: `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="ie=edge" />
  <title>Mail</title>
  <style>
    html {
      font-optical-sizing: auto;
      font-style: normal;
      font-variation-settings:
        "wdth" 100,
        "YTLC" 500;
      line-height: 24px;
    }

    a {
      text-decoration: none;
    }

    body {
      padding: 20px 30px;
      background-color: #ffffff

    }

    @media screen and (max-width: 500px) {
      body {
        padding: 5px !important;
      }
    }
  </style>
</head>

<body>
  <h1 style="margin: 0">
    <img src="{{AWS_S3_BUCKET_URL}}/public/images/mail/Layer_1.png" />
  </h1>
  <hr color="lightgray" style="height: 1px" />
  <h2 style="color: rgb(37, 228, 8); font-size: x-large">
    YOU'VE SUCCESSFULLY REGISTERED!
  </h2>
  <h3>Dear {{SORT_WALLET}},</h3>
  <p>
    We are excited to inform you that you have successfully registered for the
    <b>{{PROJECT_NAME}}</b> IDO raffle on Kyupad! Your participation in this
    exclusive event brings you one step closer to being a part of our growing
    community and accessing the potential of <b>{{PROJECT_NAME}}</b>.
  </p>
  <h3>Key Details of Your Participation:</h3>
  <section style="
        padding: 10px;
        border-radius: 5px;
        background-color: rgb(250, 250, 250);
      ">
    <p>
      <b style="color: rgb(102, 102, 102)">Raffle Entry Confirmation: </b><span>Yes</span>
    </p>
    <p>
      <b style="color: rgb(102, 102, 102)">Raffle Ticket Number: </b><span>{{YOUR_TICKET_NUMBER}}</span>
    </p>
    <p>
      <b style="color: rgb(102, 102, 102)">IDO Date: </b><span>{{IDO_DATE}}</span>
    </p>
    <p>
      <b style="color: rgb(102, 102, 102)">Token Purchase Window: </b>
      </br><span>{{START_TIME}} to {{END_TIME}}</span>
    </p>
    <p>
      <b style="color: rgb(102, 102, 102)">Allocation: </b><span>{{ALLOCATION_AMOUNT}} {{TOKEN_SYMBOL}} Tokens</span>
    </p>
  </section>
  <h3>What to Expect Next:</h3>
  <h4>Raffle Results Announcement:</h4>
  <p>
    The raffle draw will take place on <b>{{RAFFLE_DATE}}</b>. Winners
    will be notified via email and can also check their status on our website.
    Token Purchase Process:
  </p>
  <p>
    If you win the raffle, you will receive further instructions on how to
    proceed with your token purchase. Ensure you have
    <b>{{CRYPTOCURRENCY_NAME}}</b> in your wallet for the token purchase. Stay
    Updated:
  </p>
  <p>
    Follow our official channels and join our community for the latest updates
    and announcements. <a href="{{DISCORD_LINK}}">Discord</a>, <a href="{{TWITTER_LINK}}">X (Twitter)</a>
  </p>
  <h4>Important Reminders:</h4>
  <p>
    Please make sure your email and wallet addresses are correct to avoid any
    issues. Keep this email for your records as it contains important details
    about your raffle entry. Thank you for your participation and support. We
    look forward to your continued engagement in the
    <b>{{PROJECT_NAME}}</b> ecosystem.
  </p>
  <hr color="lightgray" />
  <p>Best regards,</p>
  <p style="font-size: x-large">Kyupad Team</p>
  <div 
      style=" 
        padding: 20px; 
        background-color: #f0fcff; 
        border-radius: 5px; 
        color: #3c4043; 
        font-size: larger; 
      " 
    > 
      Our community: 
        <div style=" 
          inline-block; padding: 20px 0; 
        "> 
      <div style="display: inline-block; width: 48%"> 
        <a href="{{TWITTER_LINK}}"><img width="40" src="{{AWS_S3_BUCKET_URL}}/public/images/mail/Twitter.png" /></a> 
        <a href="{{DISCORD_LINK}}" style="margin-left: 10px"><img width="40" src="{{AWS_S3_BUCKET_URL}}/public/images/mail/Discord.png" /></a> 
      </div> 
      <div style=" 
            display: inline-block; 
            width: 48%; 
            text-align: end; 
            margin-bottom: -20px; 
          "> 
        <img height="50" style="margin-bottom: -10px" src="{{AWS_S3_BUCKET_URL}}/public/images/mail/Layer_1.png" /> 
      </div> 
    </div>
      </div> 
    </div>
  <p style="color: gray; text-align: center">
    If you have any questions or need further assistance, please do not
    hesitate to contact our support team at
    <a style="text-decoration: none" href="mailto:suport@kyupad.xyz">support@kyupad.xyz</a>.
  </p>
  <p style="color: gray; text-align: center">
    This email is for informational purposes only and does not constitute
    financial advice.
  </p>
  <p style="text-align: center">
    <a style="margin: 0px 5px; text-decoration: none" href="{{PRIVACY_POLICY_LINK}}">Privacy Policy</a>
    <a style="margin: 0px 5px; text-decoration: none" href="{{TERMS_CONDITIONS_LINK}}">Terms Conditions</a>
  </p>
  <p style="text-align: center; color: gray">
    Copyright © 2024 Kyupad. All Rights Reserved
  </p>
</body>

</html>
`,
};
export { PROJECT_REGISTERED_TMP };
