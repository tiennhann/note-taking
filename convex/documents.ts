import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { Doc, Id } from "./_generated/dataModel";
import exp from "constants";

export const get = query({
    handler: async (ctx) =>{
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated user");
        }

        const documents = await ctx.db.query("documents").collect();

        return documents;
    }
});


export const create = mutation({
    args: {
        title: v.string(),
        parentDocument: v.optional(v.id("documents"))
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();

        if (!identity) {
            throw new Error("Not authenticated user");
        }

        const userId = identity.subject;
        const documents = await ctx.db.insert("documents", {
            title: args.title,
            parentDocument: args.parentDocument,
            userId,
            isArchieved: false,
            isPublished: false,
        });

        return documents;
    }
    
})