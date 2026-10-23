import { PaymentInvoice } from '../types';

export interface TelegramSendResult {
  success: boolean;
  error?: string;
  messageId?: number;
}

/**
 * Send text message to Telegram Bot API
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string,
  parseMode: 'HTML' | 'Markdown' = 'HTML'
): Promise<TelegramSendResult> {
  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();

  if (!cleanToken || !cleanChatId) {
    return { success: false, error: 'Telegram Bot Token and Chat ID are required.' };
  }

  try {
    const url = `https://api.telegram.org/bot${cleanToken}/sendMessage`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chat_id: cleanChatId,
        text,
        parse_mode: parseMode,
        disable_web_page_preview: true
      })
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, messageId: data.result?.message_id };
    } else {
      return { 
        success: false, 
        error: data.description || 'Failed to send message to Telegram.' 
      };
    }
  } catch (err: any) {
    return { 
      success: false, 
      error: err.message || 'Network error connecting to Telegram Bot API.' 
    };
  }
}

/**
 * Send backup JSON file as a document attachment to Telegram
 */
export async function sendTelegramDocument(
  botToken: string,
  chatId: string,
  jsonContent: string,
  fileName: string,
  caption?: string
): Promise<TelegramSendResult> {
  const cleanToken = botToken.trim();
  const cleanChatId = chatId.trim();

  if (!cleanToken || !cleanChatId) {
    return { success: false, error: 'Telegram Bot Token and Chat ID are required.' };
  }

  try {
    const url = `https://api.telegram.org/bot${cleanToken}/sendDocument`;
    const blob = new Blob([jsonContent], { type: 'application/json' });
    const formData = new FormData();
    formData.append('chat_id', cleanChatId);
    formData.append('document', blob, fileName);
    if (caption) {
      formData.append('caption', caption);
      formData.append('parse_mode', 'HTML');
    }

    const response = await fetch(url, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (data.ok) {
      return { success: true, messageId: data.result?.message_id };
    } else {
      return { 
        success: false, 
        error: data.description || 'Failed to upload backup document to Telegram.' 
      };
    }
  } catch (err: any) {
    return { 
      success: false, 
      error: err.message || 'Network error uploading document to Telegram.' 
    };
  }
}

/**
 * Format real-time payment alert receipt for Telegram
 */
export function formatPaymentAlertMessage(
  payment: PaymentInvoice,
  branchName?: string
): string {
  const isPaid = payment.owedRemain <= 0.01;
  const statusEmoji = isPaid ? '✅' : '⏳';
  const statusKhmer = isPaid ? 'បានបង់ផ្តាច់ (Full Paid)' : `នៅជំពាក់ $${payment.owedRemain.toFixed(2)} (Partial Due)`;
  const branchDisplay = branchName || payment.branchId;

  return `<b>🎓 សាលា អន្តរជាតិ ហ្វូឈ័រប្រាយ (FBIS)</b>
<b>━━━━━━━━━━━━━━━━━━━━</b>
<b>🧾 វិក្កយបត្រទទួលប្រាក់ថ្មី / PAYMENT RECEIPT</b>
<b>━━━━━━━━━━━━━━━━━━━━</b>

<b>• លេខវិក្កយបត្រ:</b> <code>#${payment.invoiceNumber}</code>
<b>• សិស្ស:</b> <b>${payment.studentNameKhmer}</b> (${payment.studentName})
<b>• អត្តលេខ:</b> <code>${payment.studentCode}</code> | <b>ថ្នាក់:</b> ${payment.classGrade}
<b>• សាខា:</b> ${branchDisplay}

<b>• ប្រភេទចំណូល:</b> ${payment.title}
<b>• វដ្តបង់ប្រាក់:</b> ${payment.paymentType || 'Standard'}
<b>• ឆ្នាំសិក្សា:</b> ${payment.academicYear}

<b>💰 ព័ត៌មានទឹកប្រាក់ទូទាត់:</b>
<b>• តម្លៃពេញ:</b> $${payment.fullAmount.toFixed(2)}
${payment.discountPercent > 0 ? `<b>• បញ្ចុះតម្លៃ:</b> ${payment.discountPercent}%\n` : ''}${payment.promotionAmount > 0 ? `<b>• អាហារូបករណ៍/ប្រូម៉ូសិន:</b> -$${payment.promotionAmount.toFixed(2)}\n` : ''}<b>• ទឹកប្រាក់ត្រូវបង់:</b> $${payment.amountToBePaid.toFixed(2)}
<b>• បានបង់ជាក់ស្តែង:</b> <b>$${payment.paidUSD.toFixed(2)}</b>${payment.paidKHR > 0 ? ` (និង ${payment.paidKHR.toLocaleString()} ៛)` : ''}
<b>• នៅសល់ជំពាក់:</b> <b>$${payment.owedRemain.toFixed(2)}</b> (${(payment.owedRemain * payment.exchangeRate).toLocaleString()} ៛)

<b>• ស្ថានភាព:</b> ${statusEmoji} <b>${statusKhmer}</b>
<b>• វិធីសាស្ត្របង់ប្រាក់:</b> 💳 <b>${payment.method}</b>
<b>• បេឡាធិការ:</b> 👩‍💼 ${payment.cashierName || 'Cashier'}
<b>• កាលបរិច្ឆេទ:</b> 📅 ${payment.issuedDate}

<b>━━━━━━━━━━━━━━━━━━━━</b>
<i>🤖 ប្រព័ន្ធគ្រប់គ្រងស្វ័យប្រវត្តិ FBIS School Management</i>`;
}

/**
 * Format daily automated backup notification message for Telegram
 */
export function formatDailyBackupCaption(stats: {
  totalStudents: number;
  totalPayments: number;
  totalBranches: number;
  totalIncomeUSD: number;
  dateStr: string;
}): string {
  return `<b>🛡️ កំណត់ត្រាបម្រុងទុកទិន្នន័យប្រចាំថ្ងៃ (Daily Database Backup)</b>
<b>━━━━━━━━━━━━━━━━━━━━</b>
<b>សាលា អន្តរជាតិ ហ្វូឈ័រប្រាយ (FBIS)</b>

📅 <b>កាលបរិច្ឆេទ:</b> ${stats.dateStr}
🏫 <b>ចំនួនសាខាសរុប:</b> ${stats.totalBranches} សាខា
👨‍🎓 <b>ចំនួនសិស្សសរុប:</b> ${stats.totalStudents} នាក់
🧾 <b>ចំនួនវិក្កយបត្រសរុប:</b> ${stats.totalPayments} ច្បាប់
💵 <b>ចំណូលសរុបក្នុងប្រព័ន្ធ:</b> $${stats.totalIncomeUSD.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}

✅ ឯកសារទិន្នន័យសុវត្ថិភាព <b>JSON Backup</b> ត្រូវបានផ្ញើភ្ជាប់ជាមួយសារនេះ។
លោកអ្នកអាចប្រើប្រាស់ឯកសារនេះដើម្បីស្តារទិន្នន័យ (Restore) ឡើងវិញបានគ្រប់ពេលវេលា។
<b>━━━━━━━━━━━━━━━━━━━━</b>
<i>🔒 End-to-End Encrypted Cloud Storage Archive</i>`;
}
