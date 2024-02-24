
/*use client" is used to declare a boundary between 
a Server and Client Component modules. */
"use client";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

export const Heading = () =>{
    return(
        /*max-w-3xl: limite how width this heading can go*/
        <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
                Your Idea, Documents, & Plans. Unifed. Welcome to <span 
                className="underline">Jotion</span>
            </h1>

            <h3 className="text-base sm:text-xl md:tex2xl font-medium">
                Jotion is the connected workspace where <br />
                better, faster work happens.
            </h3>
            <Button>
                Enter Jotion
                <ArrowRight className="h-5 w-5 ml-3"/>
            </Button>
        </div>
    )
}