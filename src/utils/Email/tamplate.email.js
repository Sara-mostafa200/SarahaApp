export const emailTemplate = (OTP) => {
  return `<!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; background-color:transparent; margin: 0; padding: 20px;">
        <div style="max-width: 500px; margin: auto; background-color: #5E936C; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1); text-align: center;">
          <h2 style="color: #93DA97;">CONFIRM EMAIL CODE (OTP)</h2>
          
          <div style="font-size: 24px; letter-spacing: 5px; font-weight: bold; background-color: #f0f0f0; display: inline-block; padding: 10px 20px; border-radius: 6px; margin-top: 20px; color: #0A400C;">
           ${OTP}
          </div>
          
        </div>
      </body>
    </html>`;
};
