import { ApiProperty } from "@nestjs/swagger";
import { Equals, IsNumber, IsString } from "class-validator";

export class AuthAppleIdentityTokenPayload {
    @ApiProperty({
        description: '발급자 등록 클레임은 신원 토큰을 발급하는 주체를 식별합니다. Apple이 토큰을 생성하므로 값은 https://appleid.apple.com 입니다.',
    })
    iss: string;

    @ApiProperty({
        description: '대상 등록 클레임은 ID 토큰의 수신자를 식별합니다. 토큰은 앱에 대한 것이므로 값은 개발자 계정의 client_id입니다.',
    })
    aud: string;
    
    @ApiProperty({
        description: '만료 시간 등록 클레임은 ID 토큰이 만료되는 시간을 UTC 기준 유닉스 에포크 이후 초 단위로 식별합니다. 토큰을 확인할 때 이 값은 현재 날짜 및 시간보다 커야 합니다.',
    })
    exp: number;

    @ApiProperty({
        description: '등록된 클레임에서 발급됨은 Apple이 ID 토큰을 발급한 시간(UTC 기준 유닉스 시대 이후 초)을 나타냅니다.',
    })
    iat: number;

    @ApiProperty({
        description: '주체 등록 클레임은 ID 토큰의 주체가 되는 주체를 식별합니다. 이 토큰은 앱용이므로 이 값은 사용자에 대한 고유 식별자입니다.',
    })
    sub: string;
    
    @ApiProperty({
        description: '클라이언트 세션을 ID 토큰과 연결하기 위한 문자열입니다. 이 값은 리플레이 공격을 완화하며 인증 요청에 전달한 경우에만 존재합니다.',
    })
    nonce: string;
    
    @ApiProperty({
        description: '트랜잭션이 논스를 지원하는 플랫폼에 있는지 여부를 나타내는 부울 값입니다. 권한 요청에 논스를 보냈지만 ID 토큰에 논스 클레임이 표시되지 않는 경우, 이 클레임을 확인하여 진행 방법을 결정합니다. 이 클레임이 참이면 논스를 필수로 처리하고 트랜잭션을 실패로 처리하고, 그렇지 않으면 논스를 선택 사항으로 처리하여 계속 진행할 수 있습니다.',
    })
    nonce_supported: boolean;
    
    @ApiProperty({
        description: '사용자의 이메일 주소를 나타내는 문자열 값입니다. 이메일 주소는 사용자의 개인 이메일 중계 서비스에 따라 사용자의 실제 이메일 주소 또는 프록시 주소 중 하나입니다. 직장 및 학교에서 Apple로 로그인 사용자의 경우 이 값은 비어 있을 수 있습니다. 예를 들어 어린 학생의 경우 이메일 주소가 없을 수 있습니다.',
    })
    email: string;
    
    @ApiProperty({
        description: '서비스에서 이메일을 확인할지 여부를 나타내는 문자열 또는 부울 값입니다. 값은 문자열("true" 또는 "false") 또는 부울(참 또는 거짓)일 수 있습니다. 시스템에서 직장 및 학교용 Apple로 로그인 사용자의 이메일 주소를 확인하지 않을 수 있으며, 이러한 사용자의 경우 이 클레임은 "거짓" 또는 거짓입니다.',
    })
    email_verified: boolean;
    
    @ApiProperty({
        description: '사용자가 공유하는 이메일이 프록시 주소인지 여부를 나타내는 문자열 또는 부울 값입니다. 값은 문자열("true" 또는 "false") 또는 부울(참 또는 거짓)일 수 있습니다.',
    })
    is_private_email: boolean;
}