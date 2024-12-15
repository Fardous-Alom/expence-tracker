"use server"
import {auth} from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

interface TransactionData {
  title: string;
  amount: number;
}

interface TransactionResult {
  data?: TransactionData;
  error?: string;
}

async function addTransaction(formData: FormData): Promise<TransactionResult> {
  const textValue = formData.get("text");
  const amountValue = formData.get("amount");

  //check for input value
  if  (!textValue || textValue === "" || !amountValue) {
    return {
      error: "Please enter text and amount",
    };
  }
  //ensure text is a string
  const text: string = textValue.toString();
  //Parse amount as a number
  const amount: number = parseFloat(amountValue.toString());

  //get logged in user
  const { userId } = await auth();
 
  //check for user
  if (!userId) {
    return {
      error: "User not found",
    };
  }

  try {
    const transactionData: TransactionData = await db.transaction.create({
      data:{
        text,
        amount,
        userId
      }
    });
    revalidatePath("/");
    return {
     data: transactionData,
    };
  } catch (error) {
    return {error: "Something not added"}
  }
}

export default addTransaction;