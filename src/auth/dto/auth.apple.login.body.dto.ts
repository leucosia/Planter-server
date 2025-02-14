import { ApiProperty } from "@nestjs/swagger";

export class AuthAppleLoginBody {
    @ApiProperty({
        description: "Apple IdentityToken"
    })
    identityToken: string;
}