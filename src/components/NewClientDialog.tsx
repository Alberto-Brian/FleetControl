import React, { useRef, useState } from "react";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { useForm } from "react-hook-form";
import { RegisterClientSchemaType, registerClientSchema } from "@/lib/forms/register-client-schema";
import { zodResolver } from "@hookform/resolvers/zod";
import RegisterClientInputs from "./RegisterClientInputs";
import { Form } from "./ui/form";
import SubmitButton from "./SubmitButton";
import { createClient } from "@/helpers/client-helpers";
import { Client } from "@/lib/types/client";
import { useToast } from "./ui/use-toast";
import { useTranslation } from "react-i18next";

interface NewClientDialogProps {
    onRegisterClient?: ((newClient: Client) => void) | undefined;
}

export default function NewClientDialog({ onRegisterClient }: NewClientDialogProps) {
    const { t } = useTranslation();
    const form = useForm<RegisterClientSchemaType>({
        resolver: zodResolver(registerClientSchema),
        defaultValues: {
            name: "",
            email: "",
        },
    });
    const { toast } = useToast();
    const [isPendingRegister, setIsPendingRegister] = useState(false);
    // Ref para acessar o botão de fechar
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    function onClientRegistered(client: Client) {
        form.setFocus("name");
        form.reset();

        toast({
            title: t("toast:clientRegisteredTitle"),
            description: t("toast:clientRegisteredDescription", { name: client.name }),
        });
        onRegisterClient?.(client);
        // Fechar o dialog clicando no botão programaticamente
        closeButtonRef.current?.click();
    }

    function onSubmit(data: RegisterClientSchemaType) {
        setIsPendingRegister(true);
        createClient(data)
            .then((client) => {
                if (!client) {
                    return;
                }
                onClientRegistered(client);
            })
            .finally(() => setIsPendingRegister(false));
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">{t("homePage:registerNewClientButton")}</Button>
            </DialogTrigger>
            <DialogContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)}>
                        <DialogHeader>
                            <DialogTitle>{t("registerClientDialog:registerClient")}</DialogTitle>
                        </DialogHeader>
                        <RegisterClientInputs control={form.control} />
                        <DialogFooter className="gap-2">
                            <DialogClose asChild>
                                <Button 
                                    type="button" 
                                    variant="ghost"
                                    ref={closeButtonRef}
                                >
                                    {t("registerClientDialog:cancelButton")}
                                </Button>
                            </DialogClose>
                            <SubmitButton isLoading={isPendingRegister}>
                                {isPendingRegister
                                    ? t("registerClientDialog:submitButtonLoading")
                                    : t("registerClientDialog:submitButton")}
                            </SubmitButton>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}